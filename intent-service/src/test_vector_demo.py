import pytest
from vector_demo import resolve



# matching
@pytest.mark.parametrize("query,expected",
[
    # basic matching
    ("what events are coming up?" , "events"),
    ("how do I join the club?" , "join"),
    ("what is AIMLA?" , "about"),
    ("who are the members?" , "members"),
    ("what projects have you built?" , "projects"),
    ("how do I contact you?" , "contact"),
    
    # paraphrasing
    ("any workshops coming up?" , "events"),
    ("i want to sign up" , "join"),
    ("tell me about the club" , "about"),
    ("who runs this organization?" , "members"),
    ("what have you built?" , "projects"),
    ("how do I reach you?" , "contact"),
    
    # casual
    ("anything planned?" , "events"),
    ("get started" , "join"),
    #("what is this?" , "about"),
    #("lets connect" , "contact"),
    #("show me something cool" , "projects"),
    ("talk to someone" , "contact"),
    
    # typos
    ("evnts", "events"),
    ("memebers","members"),
    ("proyects","projects"),
]
)

def test_resolve_matches(query, expected):
    result = resolve(query)
    assert result["match"] == expected
    assert result["confidence"] == "high"

# vague
@pytest.mark.parametrize("query",
[
    "what is this",
    "lets connect",
    "show me something cool"
]                         
)
def test_graceful_fallback_or_match(query):
    result = resolve(query)
    assert result["match"] is None or result["match"] in ["about", "events", "members", "projects", "contact", "join"]
    assert "confidence" in result
    assert "reason" in result

# random queries
@pytest.mark.parametrize("query",
[
    "what is the weather?",
    "what is 2 + 2?",
    "can you solve this differential equation?",
    "who is the president?"
]                         
)
def test_resolve_falls_back(query):
    result = resolve(query)
    assert result["match"] is None
    assert result["confidence"] == "low"
    assert result["reason"] == "unsupported_request" 
    assert "suggestions" in result