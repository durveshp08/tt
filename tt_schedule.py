days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
slots = [
    ("9:00-10:00", "L"), ("10:00-11:00", "L"),
    ("11:00-11:40", "R"), ("11:40-12:40", "L"),
    ("12:40-1:40", "L"), ("1:40-2:00", "B"),
    ("2:00-3:00", "L"), ("3:00-4:00", "L")
]

def get_subject(prompt):
    while True:
        parts = input(prompt).strip().split()
        if len(parts) >= 2 and parts[-1].isdigit():
            name, freq = " ".join(parts[:-1]), int(parts[-1])
        elif len(parts) == 1:
            text = parts[0]
            i = len(text)
            while i > 0 and text[i - 1].isdigit():
                i -= 1
            if 0 < i < len(text):
                name, freq = text[:i], int(text[i:])
            else:
                print("Enter the subject and weekly frequency, e.g. CCL 1 or CCL1.")
                continue
        else:
            print("Enter the subject and weekly frequency, e.g. CCL 1 or CCL1.")
            continue
        if name and freq > 0:
            return name.upper(), freq
        print("Frequency must be greater than 0.")

theory, labs = [], []
n = int(input("Number of theory subjects: "))
for i in range(n):
    name, freq = get_subject("Theory subject and times/week (e.g. AI 3): ")
    theory += [name] * freq

n = int(input("Number of lab subjects: "))
for i in range(n):
    name, freq = get_subject("Lab subject and sessions/week (e.g. AIL 2): ")
    labs += ["LAB-" + name] * freq

def rotate(items, step):
    if not items:
        return []
    step %= len(items)
    return items[step:] + items[:step]

def make_timetable(version):
    table = {}
    for day in days:
        table[day] = ["FREE" if kind == "L" else "BREAK" if kind == "B" else "RECESS" for time, kind in slots]
    pairs = [(d, s) for s in (0, 3, 6) for d in range(5)]
    pairs = rotate(pairs, version * 2)
    for i, lab in enumerate(rotate(labs, version)[:len(pairs)]):
        d, s = pairs[i]
        table[days[d]][s] = lab + " [1/2]"
        table[days[d]][s + 1] = lab + " [2/2]"
    subjects = rotate(theory, version)
    for day in days:
        used = []
        for i, (time, kind) in enumerate(slots):
            if kind != "L" or table[day][i] != "FREE" or not subjects:
                continue
            pick = 0
            for j, subject in enumerate(subjects):
                if subject not in used:
                    pick = j
                    break
            subject = subjects.pop(pick)
            table[day][i] = subject
            used.append(subject)
    return table

def show(table):
    print("\nWEEKLY TIMETABLE")
    print(f"{'TIME / TYPE':<22}", end="")
    for day in days:
        print(f"{day.upper():<18}", end="")
    print("\n" + "-" * 112)
    for i, (time, kind) in enumerate(slots):
        label = (time + " (" + {"L": "Lecture", "B": "Break", "R": "Recess"}[kind] + ")").upper()
        print(f"{label:<22}", end="")
        for day in days:
            print(f"{table[day][i].upper():<18}", end="")
        print()

if len(labs) > 15 or len(theory) + 2 * len(labs) > 30:
    print("Warning: The requested subjects need more periods than this timetable provides.")

version = 0
while True:
    show(make_timetable(version))
    choice = input("\nType refresh or done: ").strip().lower()
    if choice == "refresh":
        version += 1
    elif choice == "done":
        break
