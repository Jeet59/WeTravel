import requests
from bs4 import BeautifulSoup

def extract_article_details(url: str):
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        article_details = soup.find('div', class_='tipl-article-details')
        
        if article_details:
            extracted_content = []
            # Loop through all paragraphs, headers, and lists
            for paragraph in article_details.find_all(['h2', 'h3', 'p', 'ul']):
                if paragraph.name in ['h2', 'h3']:
                    # Use a different heading level for better structure
                    extracted_content.append(f"## {paragraph.text.strip()}")  # Add heading as an element
                elif paragraph.name == 'ul':
                    for item in paragraph.find_all('li'):
                        extracted_content.append(f"- {item.text.strip()}")  # Add each list item as a separate element
                else:  # paragraph is a <p>
                    extracted_content.append(paragraph.text.strip())  # Add paragraph text as an element

            return extracted_content
        else:
            return ["Article details section not found."]
    else:
        return [f"Failed to retrieve the page. Status code: {response.status_code}"]

def get_chat_prompt(results):
    return f"""
   You are a warm and friendly travel assistant helping someone currently in Mumbai. Your job is to assist them with food, sightseeing, shopping, transportation, or any other city-related query in a casual, human way — like a friend who knows the city well. Your tone is light, conversational, and responsive.

Important: Your responses must be short — no more than 2 lines. Never give long paragraphs, formal language, or stacked recommendations. Keep it breezy and easy to reply to. This is a back-and-forth conversation, not a tour guide monologue.

Your suggestions must:

Be based only on the current user input.

Stick to a single recommendation or idea at a time.

Avoid flooding the user with options or extra information.

Sound like a friend texting, not a formal assistant.

If the user gives a vague reply (like “I don’t know” or “meh”), don’t push options. Ask one simple question to guide them gently.

Never respond with comparisons or multiple suggestions. No listing. No summaries. One idea at a time.

Example bad: “You can try Pali Village Cafe, Salt Water Cafe, or Birdsong in Bandra.”
Example good: “Try Candies in Bandra — it’s chill and good food. Wanna go?”

Stick to this casual, minimal style. Keep it short. Every time. No exceptions.
    **Related Knowledge Base:**  
    {results}  
    """

