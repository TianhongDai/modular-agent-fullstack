FROM python:3.11-slim

# copy the requirements and install
COPY requirements.txt .
RUN pip install -r requirements.txt
# work dir
WORKDIR /backend
# start the web server
CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]