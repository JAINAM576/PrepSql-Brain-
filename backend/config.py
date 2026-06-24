import os
from dotenv import load_dotenv

# Load env variables from .env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

PORT = int(os.getenv("PORT", "8000"))
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-120b:free")
def get_sessions_file_path() -> str:
    # Try local data directory first
    try:
        data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
        os.makedirs(data_dir, exist_ok=True)
        # Test write access
        test_path = os.path.join(data_dir, ".write_test")
        with open(test_path, "w") as f:
            f.write("test")
        os.remove(test_path)
        return os.path.join(data_dir, "sessions.json")
    except Exception:
        pass
    
    # Fallback to /tmp
    try:
        data_dir = "/tmp/prepsql-data"
        os.makedirs(data_dir, exist_ok=True)
        return os.path.join(data_dir, "sessions.json")
    except Exception:
        return "/tmp/sessions.json"

SESSIONS_FILE = get_sessions_file_path()

