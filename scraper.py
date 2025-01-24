import urllib.request
import urllib.error
import urllib.parse
from html.parser import HTMLParser
import json

class LinkParser(HTMLParser):
  def __init__(self):
    super().__init__()
    self.links = []
    
  def handle_starttag(self, tag, attrs):
    if tag == 'a':
      for attr in attrs:
        if attr[0] == 'href':
          self.links.append(attr[1])

def scrape_url(url):
  try:
    # Add User-Agent header to avoid some blocks
    headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req) as response:
      html = response.read().decode('utf-8')
      
      # Parse links
      parser = LinkParser()
      parser.feed(html)
      
      # Create result object
      result = {
        'url': url,
        'status': response.status,
        'links': parser.links[:10], # First 10 links
        'content_preview': html[:500] # First 500 chars
      }
      
      # Save to file
      with open('result.json', 'w') as f:
        json.dump(result, f, indent=2)
        
      return result
      
  except urllib.error.URLError as e:
    print(f"Error fetching URL: {e}")
    return None

def main():
  url = input("Enter URL to scrape: ").strip()
  
  if not url.startswith(('http://', 'https://')):
    print("Please enter a valid URL starting with http:// or https://")
    return
    
  result = scrape_url(url)
  if result:
    print("\nResults saved to result.json")
    print(f"\nFound {len(result['links'])} links")
    print("\nFirst few links:")
    for link in result['links'][:5]:
      print(f"- {link}")

if __name__ == "__main__":
  main()
