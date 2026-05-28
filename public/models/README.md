# face-api.js models

Place **Tiny Face Detector** weights here so they are served at `/models/*`.

Required files:

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`

Download from the official face-api.js repository:

```bash
# From project root (PowerShell)
$base = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
Invoke-WebRequest -Uri "$base/tiny_face_detector_model-weights_manifest.json" -OutFile "public/models/tiny_face_detector_model-weights_manifest.json"
Invoke-WebRequest -Uri "$base/tiny_face_detector_model-shard1" -OutFile "public/models/tiny_face_detector_model-shard1"
```

The `AIExamProctor` component loads these via `faceapi.nets.tinyFaceDetector.loadFromUri("/models")`.
