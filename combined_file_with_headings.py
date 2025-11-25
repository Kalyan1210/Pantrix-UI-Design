
# --- Start of file: onefileglob.py ---

import glob
import os

output_filename = 'combined_file_with_headings.py'
file_list = glob.glob('*.py') # Finds all .py files in the current directory

# Define a simple heading format (e.g., using comments)
HEADING_FORMAT = "\n# --- Start of file: {} ---\n\n"

with open(output_filename, 'w') as outfile:
    for filename in file_list:
        if filename == output_filename:
            continue # Skip the output file itself

        # 1. Write the filename heading to the output file
        heading = HEADING_FORMAT.format(filename)
        outfile.write(heading)

        # 2. Write the content of the current input file
        try:
            with open(filename, 'r') as infile:
                outfile.write(infile.read())
        except IOError as e:
            print(f"Error reading file {filename}: {e}")
            continue
        
        # 3. Add a blank line or a closing marker for separation
        outfile.write("\n\n# --- End of file: {} ---\n\n".format(filename))

print(f"Successfully combined {len(file_list)} files into {output_filename}")


# --- End of file: onefileglob.py ---

