#!/bin/bash

FILE=$1
START_DATE="2025-01-01 00:00:00"

if [ -z "$FILE" ]; then
  echo "Usage: $0 <file>"
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "File does not exist!"
  exit 1
fi

# Read current content including unstaged changes
CONTENT=$(cat "$FILE")

# Save the last committed version
ORIGINAL=$(git show HEAD:"$FILE")

# Reset the file to its last committed state
echo "$ORIGINAL" > "$FILE"
git checkout -- "$FILE"

# Convert start date to epoch (macOS format)
current_date=$(date -jf "%Y-%m-%d %H:%M:%S" "$START_DATE" +%s)
index=0
length=${#CONTENT}

# Clear the file
> "$FILE"

while [ $index -lt $length ]; do
  # Pick 1-6 characters for this day
  count=$(( (RANDOM % 6) + 1 ))

  # Convert current_date to ISO 8601 (UTC) format
  day_date=$(date -u -r "$current_date" +"%Y-%m-%dT%H:%M:%S")

  echo "📅 Committing $count character(s) on $(date -r "$current_date" +%Y-%m-%d)"

  for (( i=0; i<$count && $index<$length; i++ )); do
    CHAR="${CONTENT:$index:1}"
    echo -n "$CHAR" >> "$FILE"

    git add "$FILE"
    GIT_AUTHOR_DATE="$day_date" GIT_COMMITTER_DATE="$day_date" \
      git commit -m "Add char: $CHAR"

    index=$((index + 1))
  done

  # Move to next day (86400 seconds)
  current_date=$((current_date + 86400))
done

echo "✅ All unstaged characters committed, date-wise, starting from $START_DATE"
