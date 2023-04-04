import csv
import sys

import regex


def main():
    # takes two arguments: the input file and the output file
    input_file = sys.argv[1]  # .txt
    output_file = sys.argv[2]  # .csv

    # open the input file and read
    with open(input_file, 'r') as txt_in_file:
        with open(output_file, 'w', newline='') as csv_out_file:
            # input file is a training dataset with -- as the delimiter

            csv_writer = csv.writer(csv_out_file, delimiter=',')

            # header row
            csv_writer.writerow(['examples'])

            # use regex to match the number in the front of the row
            for row in txt_in_file.readlines():
                # trim off the number using regex
                regex_match = regex.match(r'\d+. ', row)
                if regex_match:
                    csv_writer.writerow([row[regex_match.end():].strip()])


if __name__ == '__main__':
    main()
