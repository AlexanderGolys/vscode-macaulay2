R = QQ[x, y]
I = ideal(x^2, y)
J = saturate(I, x)

increment = a -> a + 1
next = increment 3

sign = n -> if (n > 0) then 1 else 2

total=1+2
