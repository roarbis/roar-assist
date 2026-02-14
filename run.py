import sys
import os

# Ensure the project root is on the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

app = create_app()

if __name__ == '__main__':
    # Get local IP for display
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        local_ip = '127.0.0.1'

    print(f'\n  Nutri-Track is running!')
    print(f'  Local:   http://localhost:5000')
    print(f'  Network: http://{local_ip}:5000')
    print(f'  (Use the Network URL on your iPhone)\n')

    app.run(host='0.0.0.0', port=5000, debug=True)
