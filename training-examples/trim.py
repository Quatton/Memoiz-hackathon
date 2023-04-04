import csv
import sys


def main():
    # takes two arguments: the input file and the output file
    input_file = sys.argv[1]  # .csv
    output_file = sys.argv[2]  # .csv

    # open the input file and read
    with open(input_file, 'r') as csv_in_file:
        with open(output_file, 'w', newline='') as csv_out_file:
            # input file is a training dataset in csv format
            # ,prompt,completion
            # We are going to trim the prompt and completion to exclude whitespace

            csv_writer = csv.writer(csv_out_file, delimiter=',')
            csv_reader = csv.reader(csv_in_file, delimiter=',')

            # header row
            csv_writer.writerow(['', 'prompt', 'completion'])

            for row in csv_reader:
                if (row[0] == ''):
                    continue

                csv_writer.writerow(
                    [row[0], row[1].strip() + '\n', row[2].strip()])


if __name__ == "__main__":
    main()
