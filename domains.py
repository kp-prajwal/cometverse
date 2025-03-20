# Read the uploaded file and format the links with double quotes and commas

input_file_path = "urllist.txt"
output_file_path = "quoted_urllist.txt"

# Read URLs from file
with open(input_file_path, "r") as file:
    urls = file.readlines()

# Format URLs with double quotes and commas
formatted_urls = ',\n'.join([f'"{url.strip()}"' for url in urls])

# Write to output file
with open(output_file_path, "w") as file:
    file.write(formatted_urls)


