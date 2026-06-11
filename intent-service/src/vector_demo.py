from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

pages = {
    # keys : description
    "about": "What is AIMLA. Our mission, vision, purpose, what we do, what the club does, our activities and goals as an AI and machine learning club at TMU. What do you guys do. Tell me about yourselves.",
    "events": "Scheduled events calendar. Upcoming and past workshops, hackathons, speaker sessions, and meetup dates.",
    "members": "Meet the team. Who runs the club. Current members, executives, directors, leads, contributors, and people who are part of TMU AIMLA.",
    "projects": "What we build. Ongoing and past AI and machine learning projects by AIMLA members.",
    "contact": "Get in touch. Reach out to TMU AIMLA with questions or collaboration opportunities.",
    "join": "Become a member. Sign up and join TMU AIMLA. Membership, registration, joining the club, getting involved.",
}

page_names = list(pages.keys())
page_descriptions = list(pages.values())
# converts the description into vector of numbers
page_embeddings = model.encode(page_descriptions) 

def find_best_match(user_input: str) -> tuple:

    input_embedding = model.encode([user_input])

    # cosine similarity
    # two arrows pointing in space, if they point in the same direction, angle between them is 0 and 1 which is a perfect match
    similarities = cosine_similarity(input_embedding, page_embeddings)[0]
    for i, score in enumerate(similarities):
        print(f"  {page_names[i]}: {score:.2f}")
    # [0] is first row since we only have 1 input
    
    # find the closest match
    best_index = np.argmax(similarities) # index with the highest score
    best_page = page_names[best_index] # use the index to get the actual page name
    best_score = similarities[best_index] # returns both page name and confidence score

    return best_page, best_score

if __name__ == "__main__":
    print("AIMLA Intent Matcher — type a query, press Enter")
    print("Type 'quit' to exit\n")

    while True:
        user_input = input("You: ").strip()
        
        if user_input.lower() == "quit":
            break
        
        if not user_input:
            continue
        
        page, score = find_best_match(user_input)
        print(f"→ Matched: [{page}] (confidence: {score:.2f})\n")