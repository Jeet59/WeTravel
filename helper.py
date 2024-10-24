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
    You are a tour guide and have the knowledge of every street in Mumbai. You know everything about the food, culture and tourist attractions of Mumbai. Our user need your help to navigate through Mumbai.
    Respond to them like a local Mumbai person would. Some related data that you might find helpful is given below.

    Related Docs: {results}
    """