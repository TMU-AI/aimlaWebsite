from vector_demo import find_best_match

# region Basic matching
def test_events_match():
    page, score = find_best_match("what events are coming up?")
    assert page == "events"

def test_join_match():
    page, score = find_best_match("how do I join the club?")
    assert page == "join"

def test_about_match():
    page, score = find_best_match("what is AIMLA?")
    assert page == "about"

def test_members_match():
    page, score = find_best_match("who are the members?")
    assert page == "members"

def test_projects_match():
    page, score = find_best_match("what projects have you built?")
    assert page == "projects"

def test_contact_match():
    page, score = find_best_match("how do I contact you?")
    assert page == "contact"
#endregion

# region Different match
def test_events_paraphrase():
    page, score = find_best_match("any workshops coming up?")
    assert page == "events"

def test_join_paraphrase():
    page, score = find_best_match("I want to sign up")
    assert page == "join"

def test_about_paraphrase():
    page, score = find_best_match("tell me about the club")
    assert page == "about"

def test_members_paraphrase():
    page, score = find_best_match("who runs this organization?")
    assert page == "members"

def test_projects_paraphrase():
    page, score = find_best_match("what have you built?")
    assert page == "projects"

def test_contact_paraphrase():
    page, score = find_best_match("how do I reach you?")
    assert page == "contact"
# endregion

# region Casual
def test_casual_join():
    page, score = find_best_match("get started")
    assert page == "join"

def test_casual_contact():
    page, score = find_best_match("talk to someone")
    assert page == "contact"

def test_casual_projects():
    page, score = find_best_match("show me something cool")
    assert page == "projects"
#endregion

# region No Relation 
def test_unrelated_weather():
    page, score = find_best_match("what is the weather")
    assert score < 0.3

def test_unrelated_math():
    page, score = find_best_match("what is 2 + 2")
    assert score < 0.3

def test_unrelated_president():
    page, score = find_best_match("who is the president")
    assert score < 0.3

# endregion