# Project Elion - Drug Discovery Sandbox

Project Elion is a drug discovery sandbox powered by Google TxGemma. It predicts molecular properties, explores SAR (Structure-Activity Relationships), and generates mechanistic explanations.

## Prerequisites

- Node.js 18+ 
- pnpm
- Google Cloud account with Vertex AI enabled
- Access to TxGemma models in Vertex AI Model Garden

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Google Cloud Configuration

This application requires Google Cloud credentials to access Vertex AI endpoints. You need to configure the following environment variables in `.env`:

```env
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_REGION=your-gcp-region (e.g., us-central1)
GOOGLE_CLOUD_CHAT_REGION=your-chat-region (e.g., us-central1)
VERTEX_AI_PREDICT_ENDPOINT_ID=your-predict-endpoint-id
VERTEX_AI_CHAT_ENDPOINT_ID=your-chat-endpoint-id
VERTEX_AI_CHAT_ENDPOINT_DOMAIN=your-chat-endpoint-domain
GOOGLE_APPLICATION_CREDENTIALS_JSON=your-service-account-key-json
```

### 3. Running the Application

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

The application will be available at `http://localhost:3000` (or another available port).

## Features

- **Molecular Input**: Support for SMILES strings, molecular sketching, and R-group exploration
- **Property Prediction**: ADMET properties, toxicity panels, binding affinities, and clinical trial predictions
- **SAR Analysis**: Structure-activity relationship exploration
- **AI Explanations**: Mechanistic explanations for predictions
- **Molecular Chat**: Conversational interface for drug design guidance

## Architecture

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Radix UI primitives with shadcn-inspired styling
- **Molecular Rendering**: smiles-drawer for 2D visualization
- **AI Integration**: Google TxGemma via Vertex AI
- **Authentication**: Google Auth Library for service account access

## Troubleshooting

### Common Issues

1. **Port Already in Use**: If port 3000 is taken, the app will automatically use another available port
2. **Lock Files**: If encountering Next.js lock errors, remove `.next` directory:
   ```bash
   rm -rf .next
   ```
3. **Google Cloud Authentication**: Ensure all environment variables are properly set and the service account has necessary permissions

### API Endpoints

- `POST /api/predict` - Predict molecular properties
- `POST /api/explain` - Get explanations for predictions
- `POST /api/chat` - Conversational drug design assistance

## Development

This project uses the following technologies:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Radix UI
- React Hook Form
- Zod for validation

Components are organized in the `components/` directory following atomic design principles.