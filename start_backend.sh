#!/bin/bash

# Tea Analyzer Backend Startup Script
# This script sets environment variables to prevent TensorFlow crashes

echo "=========================================="
echo "Starting Tea Analyzer Backend"
echo "=========================================="
echo ""

# Set TensorFlow environment variables to prevent CPU instruction errors
export TF_CPP_MIN_LOG_LEVEL=2
export CUDA_VISIBLE_DEVICES=-1
export TF_ENABLE_ONEDNN_OPTS=0
export OMP_NUM_THREADS=1
export MKL_NUM_THREADS=1

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    echo "✅ Activating virtual environment..."
    source .venv/bin/activate
else
    echo "⚠️  Virtual environment not found. Run 'bash setup.sh' first."
    exit 1
fi

echo "🚀 Starting Flask backend..."
echo ""

# Start the backend
python app.py
