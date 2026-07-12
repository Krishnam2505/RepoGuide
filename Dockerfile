FROM python:3.10

WORKDIR /code

# Install dependencies first for better caching
COPY ./backend/requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Create a non-root user (strict requirement for Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy the backend code into the app directory
COPY --chown=user ./backend $HOME/app

# Hugging Face Spaces exposes port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
