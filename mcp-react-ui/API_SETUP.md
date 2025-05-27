# Setting Up Gemini API

To use the chat functionality in this Gemini UI clone, you need to set up a Gemini API key.

## Steps to get a Gemini API key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey) website
2. Sign in with your Google account
3. Create a new API key

## Adding your API key to the project

1. Create a `.env.local` file in the root of the project (if it doesn't exist)
2. Add your API key:

```bash
# Gemini API Key
GOOGLE_API_KEY="your-api-key-here"
```

Replace `your-api-key-here` with your actual API key (without quotes).

## Important Notes

- Make sure there are no spaces around the equals sign
- Don't use quotes around your API key
- The variable name must be exactly `GOOGLE_API_KEY`
- After changing the `.env.local` file, you need to restart the development server

## Running the app

1. Save your `.env.local` file
2. Stop any running development server (Ctrl+C or Cmd+C)
3. Start the development server again:

```bash
npm run dev
```

## Troubleshooting

If you're still seeing the API key warning:

1. Verify your `.env.local` file is in the root directory (same level as package.json)
2. Double-check the variable name is exactly `GOOGLE_API_KEY`
3. Make sure there are no quotes or spaces in the API key
4. Restart the development server completely

The chat functionality should work once the API key is properly configured. 