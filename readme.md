Yojimbo Parser
==============

Reads exported [Yojimbo](http://www.barebones.com/products/yojimbo/) passwords and serial numbers and converts them into CSV files. This way they can be easily imported to other software, such as [1Password](https://1password.com).

Usage
-----

1. Install dependencies using `yarn`
2. Build the script using `yarn build`
3. Use drag and drop to export the Yojimbo data to a folder in the Finder
4. Run the script with `node built/parser path/to/folder path/to/file.csv`
5. Do whatever you wish with the generated CSV file

- - -

Copyright Philipp Katz, 2018
