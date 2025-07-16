import json

def main():
    raw_data = "core/fixtures/raw_topic_data.txt"
    
    with open(raw_data, "r") as file:
        fixture = list()
        for i, line in enumerate(file):
            topic = line.strip()

            if not topic:
                continue

            entry = dict()
            entry["model"] = "core.Topic"
            entry["pk"] = i + 1
            entry["fields"] = dict()
            entry["fields"]["name"] = topic 
            entry["fields"]["description"] = "no description for now" 
            fixture.append(entry)

        with open("core/fixtures/topics_fixture.json", "w+") as write_file:
            write_file.write(json.dumps(fixture, indent=4))

if __name__ == "__main__":
    main()