import os
import sys
import re

def update_todo(issue_title, issue_body):
    todo_path = "todo.md"
    if not os.path.exists(todo_path):
        print(f"Error: {todo_path} not found.")
        return

    with open(todo_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Find the "現在のタスク状況" section
    section_index = -1
    for i, line in enumerate(lines):
        if "## 🛠 現在のタスク状況" in line:
            section_index = i
            break

    if section_index == -1:
        # If not found, append to the end
        lines.append(f"\n## 🛠 現在のタスク状況\n")
        section_index = len(lines) - 1

    # Insert the new task after the section header or sub-section
    new_task = f"- [ ] {issue_title}\n"
    if issue_body:
        # Indent body lines for todo.md readability
        indented_body = "\n  ".join(issue_body.splitlines())
        new_task += f"  > {indented_body}\n"

    lines.insert(section_index + 2, new_task)

    with open(todo_path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    
    print(f"Updated todo.md with task: {issue_title}")

def main():
    issue_title = os.getenv("ISSUE_TITLE")
    issue_body = os.getenv("ISSUE_BODY")

    if not issue_title:
        print("Error: ISSUE_TITLE is not set.")
        sys.exit(1)

    print(f"Processing Issue: {issue_title}")
    update_todo(issue_title, issue_body or "")

if __name__ == "__main__":
    main()
