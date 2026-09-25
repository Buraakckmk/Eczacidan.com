"""T.C. Kimlik No ve GLN doğrulama yardımcıları."""

from __future__ import annotations


def normalize_gln(value: str) -> str:
    return value.replace(" ", "").strip()


def calculate_gln_check_digit(prefix: str) -> int:
    digits = [int(char) for char in prefix]
    total = 0
    for index, digit in enumerate(reversed(digits)):
        multiplier = 3 if index % 2 == 0 else 1
        total += digit * multiplier
    remainder = total % 10
    return (10 - remainder) % 10


def is_valid_gln(value: str) -> bool:
    normalized = normalize_gln(value)
    if not normalized.isdigit():
        return False
    if len(normalized) != 13:
        return False
    body = normalized[:-1]
    expected_check_digit = calculate_gln_check_digit(body)
    return int(normalized[-1]) == expected_check_digit


def is_valid_tc(value: str) -> bool:
    """T.C. Kimlik No algoritmik doğrulaması.

    Kurallar:
    - 11 haneli olmalı, sadece rakamlardan oluşmalı
    - İlk hane 0 olamaz
    - 10. hane = (d1+d3+d5+d7+d9)*7 - (d2+d4+d6+d8)  mod 10
    - 11. hane = (d1..d10) toplamının mod 10'u
    """
    tc = value.strip().replace(" ", "")
    if len(tc) != 11 or not tc.isdigit():
        return False
    if tc[0] == "0":
        return False
    d = [int(ch) for ch in tc]
    odd_sum = d[0] + d[2] + d[4] + d[6] + d[8]
    even_sum = d[1] + d[3] + d[5] + d[7]
    tenth = (odd_sum * 7 - even_sum) % 10
    eleventh = (sum(d[:10])) % 10
    return d[9] == tenth and d[10] == eleventh
