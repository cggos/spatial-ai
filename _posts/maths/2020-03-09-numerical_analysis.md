---
layout: article
title:  "Numerical Analysis"
date:   2020-03-09
tags: Maths

---

## 插值（Interpolation）

### 最近邻插值（Nearest Interpolation）

$$
\mathbf{I}_\mathrm{dst}(i, j) =
\mathbf{I}_\mathrm{src}(u^{\prime}, v^{\prime}) =
\mathbf{I}_\mathrm{src}(u, v)
$$

with

$$
(i, j)
\Rightarrow
(u^{\prime}, v^{\prime})
\Rightarrow
\begin{cases}
u = \text{round}(u^{\prime}) \\
v = \text{round}(v^{\prime})
\end{cases}
$$

```C++
case INTERPOLATION_NEAREST: {
    int lx = static_cast<int>(std::round(x));
    int ly = static_cast<int>(std::round(y));
    result = (*this)(ly, lx);
}
```

### 双线性插值（Bilinear Interpolation）

$$
\mathbf{I}_\mathrm{dst}(i, j) =
\mathbf{I}_\mathrm{src}(u^{\prime}, v^{\prime}) =
\mathbf{I}_\mathrm{src}(u+\alpha, v+\beta)
$$

with

$$
(i, j)
\Rightarrow
(u^{\prime}, v^{\prime})
\Rightarrow
\begin{cases}
u = \text{floor}(u^{\prime}) = \lfloor u^{\prime} \rfloor \\
v = \text{floor}(v^{\prime}) = \lfloor v^{\prime} \rfloor
\end{cases}
\Rightarrow
\begin{cases}
\alpha = u^{\prime} - u \\
\beta  = v^{\prime} - v
\end{cases}
$$

令

$$
\begin{aligned}
f_{00} &= f(u,      v)     \\
f_{01} &= f(u,      v + 1) \\
f_{10} &= f(u + 1,  v)     \\
f_{11} &= f(u + 1,  v + 1)
\end{aligned}
$$

（1） V方向线性插值

$$
\begin{cases}
f(u,   & v+\beta) = (f_{01} - f_{00}) \beta + f_{00} \\
f(u+1, & v+\beta) = (f_{11} - f_{10}) \beta + f_{10}
\end{cases}
$$

（2） U方向线性插值

$$
f(u+\alpha, v+\beta) = [f(u+1, v+\beta) - f(u, v+\beta)]\alpha + f(u, v+\beta)
$$

（3）最终

$$
f(u+\alpha, v+\beta) =
[(1-\alpha)(1-\beta)]f_{00} +
\beta  (1-\alpha) f_{01} +
\alpha (1-\beta)  f_{10} +
\alpha \beta f_{11}
$$

```C++
case INTERPOLATION_BILINEAR: {
    const int lx = std::floor(x);
    const int ly = std::floor(y);

    _T f00 = (*this)(ly, lx);
    _T f01 = (*this)(ly + 1, lx);
    _T f10 = (*this)(ly, lx + 1);
    _T f11 = (*this)(ly + 1, lx + 1);

    double alpha = x - lx;
    double beta  = y - ly;

    result =
      (1 - beta) * ((1 - alpha) * f00 + alpha * f10) +
      beta * ((1 - alpha) * f01 + alpha * f11);
}
```
