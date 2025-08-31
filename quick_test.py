#!/usr/bin/env python3
"""
Quick test to verify Flask backend can start
"""

try:
    print("🧪 Quick Jarvis Backend Test")
    print("=" * 40)
    
    # Test imports
    print("Testing imports...")
    import flask
    print("✅ Flask imported")
    
    from flask import Flask
    print("✅ Flask Flask imported")
    
    # Test app creation
    print("\nTesting app creation...")
    app = Flask(__name__)
    print("✅ Flask app created")
    
    # Test route
    @app.route('/test')
    def test():
        return "Jarvis Backend is working!"
    
    print("✅ Test route added")
    
    print("\n🎉 Backend test successful!")
    print("You can now run: python app.py")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nPlease install dependencies:")
    print("pip install -r requirements.txt")
