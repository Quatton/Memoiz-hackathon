import csv
import sys


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
            csv_writer.writerow(['', 'prompt', 'completion'])

            i = 0
            prompt = ''
            completion = ''

            for row in txt_in_file.readlines():

                if (row.startswith('--')):
                    i += 1
                    csv_writer.writerow([i, prompt, completion])
                    prompt = ''
                    completion = ''
                    continue
                # regex match if row contains "Answer:"
                if (row.startswith('Answer:')):
                    completion = row
                elif (row.startswith('Question:')):
                    prompt += row
                else:
                    prompt += row


# run main
if __name__ == "__main__":
    main()
