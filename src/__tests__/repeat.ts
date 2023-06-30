function generateBar(
    fill: string,
    empty: string,
    current: number,
    max: number
) {
    return fill.repeat(current) + empty.repeat(max - current)
}

console.log(
    generateBar(
        "12",
        "=",
        5,
        10
    )
)