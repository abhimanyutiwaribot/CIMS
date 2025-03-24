from fastapi import FastAPI, HTTPException, UploadFile, File
from transformers import CLIPProcessor, CLIPModel, logging as transformers_logging
from pydantic import BaseModel
from PIL import Image
import io
import warnings
import torch
import logging

# Suppress warnings and configure logging
warnings.filterwarnings('ignore')
transformers_logging.set_verbosity_error()
logging.basicConfig(level=logging.ERROR)

app = FastAPI()

class IncidentAnalysis:
    def __init__(self):
        model_name = "openai/clip-vit-base-patch32"
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model = CLIPModel.from_pretrained(model_name)
        
        self.incident_types = [
            "pothole", "garbage", "streetlight", "road_damage",
            "flooding", "sidewalk_damage", "graffiti", "traffic_signal",
            "blocked_path", "tree_hazard"
        ]

    async def analyze_image(self, image_data: bytes) -> dict:
        try:
            # Process image
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            
            # Prepare text inputs for each incident type
            text_descriptions = [
                f"a photo of {incident.replace('_', ' ')}"
                for incident in self.incident_types
            ]
            
            # Process inputs
            inputs = self.processor(
                images=image,
                text=text_descriptions,
                return_tensors="pt",
                padding=True
            )
            
            # Get model predictions
            outputs = self.model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = torch.nn.functional.softmax(logits_per_image, dim=1)[0]
            
            # Get top 3 predictions
            confidences, indices = torch.topk(probs, 3)
            
            return {
                "incident_type": self.incident_types[indices[0].item()],
                "confidence": round(confidences[0].item() * 100, 2),
                "alternatives": [
                    {
                        "type": self.incident_types[idx.item()],
                        "confidence": round(conf.item() * 100, 2)
                    }
                    for idx, conf in zip(indices[1:], confidences[1:])
                ],
                "suggestion": "Please verify if the detected issue matches what you see."
            }

        except Exception as e:
            print(f"Error analyzing image: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error analyzing image. Please ensure the image is clear."
            )

# Initialize analyzer
incident_analyzer = IncidentAnalysis()

# API Models
class IssueAnalysis(BaseModel):
    text: str

# API Endpoints
@app.post("/analyze-issue")
async def analyze_issue(issue: IssueAnalysis):
    try:
        # Get both classification and severity
        classification = issue_classifier(issue.text)
        severity = severity_analyzer(issue.text)
        
        return {
            "issue_type": classification[0][0]["label"],
            "severity": severity[0]["label"],
            "confidence": round(classification[0][0]["score"] * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = await incident_analyzer.analyze_image(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="192.168.0.188", port=8000)
