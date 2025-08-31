#!/usr/bin/env python3
"""
Test script for Jarvis AI Voice Assistant
Run this to verify your setup before starting the main application
"""

import sys
import os

def test_imports():
    """Test if all required packages can be imported"""
    print("Testing imports...")
    
    try:
        import flask
        print("✅ Flask imported successfully")
    except ImportError as e:
        print(f"❌ Flask import failed: {e}")
        return False
    
    try:
        import openai
        print("✅ OpenAI imported successfully")
    except ImportError as e:
        print(f"❌ OpenAI import failed: {e}")
        return False
    
    try:
        import requests
        print("✅ Requests imported successfully")
    except ImportError as e:
        print(f"❌ Requests import failed: {e}")
        return False
    
    try:
        from dotenv import load_dotenv
        print("✅ Python-dotenv imported successfully")
    except ImportError as e:
        print(f"❌ Python-dotenv import failed: {e}")
        return False
    
    return True

def test_config():
    """Test configuration loading"""
    print("\nTesting configuration...")
    
    try:
        from config import get_config, validate_config
        config = get_config()
        print("✅ Configuration loaded successfully")
        
        # Check for API keys
        if config['openai_api_key'] == '<Your OpenAI Key Here>':
            print("⚠️  OpenAI API key not configured")
        else:
            print("✅ OpenAI API key configured")
            
        return True
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

def test_flask_app():
    """Test Flask app creation"""
    print("\nTesting Flask app...")
    
    try:
        from app import app
        print("✅ Flask app created successfully")
        return True
    except Exception as e:
        print(f"❌ Flask app test failed: {e}")
        return False

def test_ai_function():
    """Test AI processing function"""
    print("\nTesting AI function...")
    
    try:
        from app import ai_process
        response = ai_process("hello")
        print(f"✅ AI function test successful: {response[:50]}...")
        return True
    except Exception as e:
        print(f"❌ AI function test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Jarvis Voice Assistant - System Test")
    print("=" * 50)
    
    tests = [
        ("Package Imports", test_imports),
        ("Configuration", test_config),
        ("Flask App", test_flask_app),
        ("AI Function", test_ai_function)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running: {test_name}")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Jarvis is ready to run.")
        print("\nTo start Jarvis:")
        print("1. Set your OpenAI API key in a .env file")
        print("2. Run: python app.py")
        print("3. Open: http://localhost:5000")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        print("\nTo install missing packages:")
        print("pip install -r requirements.txt")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
