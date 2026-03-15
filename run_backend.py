import subprocess
import os
import sys

def main():
    # Get the directory where this script is located
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    
    # Path to the virtual environment's Python executable
    if os.name == 'nt':
        venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
    else:
        venv_python = os.path.join(backend_dir, "venv", "bin", "python")
        
    # Check if the virtual environment exists, otherwise fallback to system python
    if not os.path.exists(venv_python):
        print(f"Virtual environment python not found at {venv_python}")
        print("Falling back to system python...")
        venv_python = sys.executable

    print(f"Starting backend server using: {venv_python}")
    print(f"Working directory: {backend_dir}")
    
    try:
        # Run uvicorn using the python executable
        subprocess.run(
            [venv_python, "-m", "uvicorn", "main:app", "--reload"],
            cwd=backend_dir,
            check=True
        )
    except KeyboardInterrupt:
        print("\nBackend server stopped by user.")
    except Exception as e:
        print(f"\nFailed to start backend: {e}")

if __name__ == "__main__":
    main()














