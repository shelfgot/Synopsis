def generate_edit_graph(str1, str2):
    
    len1 = len(str1)
    len2 = len(str2)
    
    
    grid = [[' ' for _ in range(len1)] for _ in range(len2)]
    
    
    for i in range(len2):
        for j in range(len1):
            if str2[i] == str1[j]:
                grid[i][j] = '\\'  

    
    ascii_graph = ""
    
    
    ascii_graph += "      " + "   ".join(str1) + "\n"
    
    
    ascii_graph += "    " + "----" * len(str1) + "\n"
    
    
    for i in range(len2):
        
        ascii_graph += str2[i] + "   "
        
        
        for j in range(len1):
            ascii_graph += "| " + grid[i][j] + " "
        ascii_graph += "|\n"
        
        
        ascii_graph += "    " + "----" * len(str1) + "\n"
    
    
    return ascii_graph


str2 = 'א״ר מאיר התירו א"ל רב אחא בר אביי לרבינא היכי דמי אילימא בשוגג'
str1 = '''אמר ר׳ מאיר התירו אמר לי' רב אחא בר אביי לרבינא ה"ד אילימ' בשוגג'''
ascii_graph = generate_edit_graph(str1, str2)

output_file = "edit_graph.txt"
with open(output_file, "w", encoding="utf-8") as file:
    file.write(ascii_graph)

print(f"Edit graph saved to {output_file}")
