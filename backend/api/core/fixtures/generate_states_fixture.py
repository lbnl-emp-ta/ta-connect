import json

def main():
    raw_data = "core/fixtures/raw_states_data.txt"
    
    with open(raw_data, "r") as file:
        state_info_list = list()
        for line in file:
            state, abbr = line.split(",")
            state_info_list.append((state.strip(), abbr.strip()))
        
    fixture = list()
    for i, (state, abbr) in enumerate(state_info_list):
        entry = dict()
        entry["model"] = "core.State"
        entry["pk"] = i + 1
        entry["fields"] = dict()
        entry["fields"]["name"] = state
        entry["fields"]["abbreviation"] = abbr
        fixture.append(entry)
    
    with open("core/fixtures/states_fixture.json", "w+") as write_file:
        write_file.write(json.dumps(fixture, indent=4))

if __name__ == "__main__":
    main()