def generic_template(receipient_name: str, message: str) -> str:
    template = f"""Hello {receipient_name},\n\n{message}\n\nThank you,\nTACONNECT"""
    return template