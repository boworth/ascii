#!/usr/bin/env python3
"""
Simple Slack Notification Service for TRNG.le API Access Requests

This microservice receives contact form submissions and sends them to Slack
using the slack_sdk (same as elkutils uses).

Usage:
    python main.py

Requirements:
    pip install aiohttp slack_sdk

Environment Variables:
    SLACK_CHANNEL: Slack channel to send notifications to (default: bo_test_slackbot)
    PORT: Port to run the service on (default: 8765)
"""

import json
import logging
import os
import sys
from datetime import datetime, timezone

from aiohttp import web
from slack_sdk import WebClient

# Slack token from environment (fallback to elkutils default for backward compatibility)
SLACK_KEY = os.getenv('SLACK_TOKEN')

def slack(message, channel, blocks=None, **kwargs):
    """Send a message to Slack (same implementation as elkutils)."""
    s = WebClient(token=SLACK_KEY)
    try:
        return s.chat_postMessage(channel=channel, text=message, blocks=blocks, **kwargs)
    except Exception as e:
        print('Failed to post: ' + message, "Error", str(e))
        raise

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('slack_notifier')

# Configuration
SLACK_CHANNEL = os.getenv('SLACK_CHANNEL', 'bo_test_slackbot')
PORT = int(os.getenv('PORT', 8765))


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """Sanitize user input to prevent injection attacks."""
    if not text:
        return ''
    # Remove potential Slack formatting exploits and limit length
    text = str(text)[:max_length]
    # Escape special Slack characters
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return text

def format_slack_message(data: dict) -> str:
    """Format the contact form data into a Slack message."""
    account_type = sanitize_input(data.get('accountType', 'unknown'), 20)
    email = sanitize_input(data.get('email', 'N/A'), 100)
    info = sanitize_input(data.get('info', 'N/A'), 2000)
    telegram = sanitize_input(data.get('telegram', ''), 50) or 'Not provided'
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
    
    if account_type == 'company':
        company_name = sanitize_input(data.get('companyName', 'N/A'), 100)
        name_line = f"🏢 *Company:* {company_name}"
    else:
        first_name = sanitize_input(data.get('firstName', ''), 50)
        last_name = sanitize_input(data.get('lastName', ''), 50)
        name_line = f"👤 *Name:* {first_name} {last_name}"
    
    message = f"""
🔔 *New TRNG.le API Access Request*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{name_line}
📧 *Email:* {email}
💬 *Telegram:* {telegram}

📝 *Use Case:*
{info}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Submitted at {timestamp}_
"""
    return message.strip()


async def handle_contact(request: web.Request) -> web.Response:
    """Handle POST /contact requests."""
    try:
        data = await request.json()
        logger.info(f"📩 Received contact request from: {data.get('email', 'unknown')}")
        
        # Validate required fields
        if not data.get('email') or not data.get('info'):
            return web.json_response(
                {'error': 'Missing required fields (email, info)'},
                status=400
            )
        
        account_type = data.get('accountType', 'individual')
        if account_type == 'company' and not data.get('companyName'):
            return web.json_response(
                {'error': 'Company name is required for company accounts'},
                status=400
            )
        
        if account_type == 'individual' and (not data.get('firstName') or not data.get('lastName')):
            return web.json_response(
                {'error': 'First and last name are required for individual accounts'},
                status=400
            )
        
        # Format and send Slack message
        message = format_slack_message(data)
        
        try:
            slack(message, channel=SLACK_CHANNEL)
            logger.info(f"✅ Slack notification sent to #{SLACK_CHANNEL}")
        except Exception as e:
            logger.error(f"❌ Failed to send Slack notification: {e}")
            return web.json_response(
                {'error': 'Failed to send notification'},
                status=500
            )
        
        return web.json_response({
            'success': True,
            'message': 'Request submitted successfully'
        })
        
    except json.JSONDecodeError:
        return web.json_response({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"❌ Error processing contact request: {e}")
        return web.json_response({'error': str(e)}, status=500)


async def handle_health(request: web.Request) -> web.Response:
    """Health check endpoint."""
    return web.json_response({
        'status': 'healthy',
        'slack_channel': SLACK_CHANNEL,
        'timestamp': datetime.now(timezone.utc).isoformat()
    })


def create_app() -> web.Application:
    """Create the aiohttp application."""
    app = web.Application()
    
    # Add CORS middleware
    @web.middleware
    async def cors_middleware(request, handler):
        if request.method == 'OPTIONS':
            response = web.Response()
        else:
            response = await handler(request)
        
        # Restrict CORS to internal Docker network only (web container)
        allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://web:3000,http://localhost:3000').split(',')
        origin = request.headers.get('Origin', '')
        if origin in allowed_origins or not origin:  # Allow no-origin (internal calls)
            response.headers['Access-Control-Allow-Origin'] = origin or '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    app.middlewares.append(cors_middleware)
    
    # Add routes
    app.router.add_post('/contact', handle_contact)
    app.router.add_get('/health', handle_health)
    app.router.add_options('/contact', lambda r: web.Response())
    
    return app


def main():
    """Main entry point."""
    logger.info(f"🚀 Starting Slack Notifier Service on port {PORT}")
    logger.info(f"📡 Slack channel: #{SLACK_CHANNEL}")
    
    # Send startup confirmation to Slack
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
    try:
        slack(f"🚀 *TRNG.le Contact Form Notifier Started*\n_Service online at {timestamp}_", channel=SLACK_CHANNEL)
        logger.info(f"✅ Startup confirmation sent to #{SLACK_CHANNEL}")
    except Exception as e:
        logger.error(f"❌ Failed to send startup confirmation: {e}")
    
    app = create_app()
    web.run_app(app, host='0.0.0.0', port=PORT)


if __name__ == '__main__':
    main()
