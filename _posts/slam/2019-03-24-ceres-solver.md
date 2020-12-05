---
layout: article
title: "Ceres-Solver 从入门到上手视觉SLAM位姿优化问题"
date: 2019-03-24
tags: SLAM

---

[TOC]

# 概述

> [Ceres Solver](http://ceres-solver.org) is an open source C++ library for modeling and solving large, complicated optimization problems.

使用 Ceres Solver 求解非线性优化问题，主要包括以下几部分：

* 构建代价函数(cost function) 或 残差(residual)
* 构建优化问题(`ceres::Problem`)：通过 `AddResidualBlock` 添加代价函数(cost function)、损失函数(loss function) 和 待优化状态量
  - **LossFunction**: a scalar function that is used to reduce the influence of outliers on the solution of non-linear least squares problems.
* 配置求解器(`ceres::Solver::Options`)
* 运行求解器(`ceres::Solve(options, &problem, &summary)`)

**注意**：  

Ceres Solver 只接受最小二乘优化，也就是 $\min r^T r$；若要对残差加权重，使用马氏距离，即 $\min r^T P^{-1} r$，则要对 信息矩阵$P^{-1}$ 做 Cholesky分解，即 $LL^T=P^{−1}$，则 $d = r^T (L L^T) r = (L^T r)^T (L^T r)$，令 $r' = (L^T r)$，最终 $\min r'^T r'$。

**代码**：[cggos/state_estimation](https://github.com/cggos/state_estimation)

# 入门

先以最小化下面的函数为例，介绍 Ceres Solver 的基本用法

$$
\frac{1}{2} (10 - x)^2
$$

## Part 1: Cost Function

（1）AutoDiffCostFunction（自动求导）

* 构造 **代价函数结构体**（例如：`struct CostFunctor`），在其结构体内对 模板括号`()` 重载，定义残差
* 在重载的 `()` 函数 形参 中，**最后一个为残差，前面几个为待优化状态量**

```c++
struct CostFunctor {
    template<typename T>
    bool operator()(const T *const x, T *residual) const {
        residual[0] = 10.0 - x[0]; // r(x) = 10 - x
        return true;
    }
};
```

* 创建代价函数的实例，对于模板参数的数字，**第一个为残差的维度，后面几个为待优化状态量的维度**

```c++
ceres::CostFunction *cost_function;
cost_function = new ceres::AutoDiffCostFunction<CostFunctor, 1, 1>(new CostFunctor);
```

（2） NumericDiffCostFunction

* **数值求导法** 也是构造 **代价函数结构体**，但在重载 括号`()` 时没有用模板

```c++
struct CostFunctorNum {
    bool operator()(const double *const x, double *residual) const {
        residual[0] = 10.0 - x[0]; // r(x) = 10 - x
        return true;
    }
};
```

* 并且在实例化代价函数时也稍微有点区别，多了一个模板参数 `ceres::CENTRAL`

```c++
ceres::CostFunction *cost_function;
cost_function =
new ceres::NumericDiffCostFunction<CostFunctorNum, ceres::CENTRAL, 1, 1>(new CostFunctorNum);
```

（3） 自定义 CostFunction

* 构建一个 继承自 `ceres::SizedCostFunction<1,1>` 的类，同样，对于模板参数的数字，**第一个为残差的维度，后面几个为待优化状态量的维度**
* 重载 虚函数`virtual bool Evaluate(double const* const* parameters, double *residuals, double **jacobians) const`，根据 待优化变量，实现 **残差和雅克比矩阵的计算**

```c++
class SimpleCostFunctor : public ceres::SizedCostFunction<1,1> {
public:
    virtual ~SimpleCostFunctor() {};

    virtual bool Evaluate(
      double const* const* parameters, double *residuals, double** jacobians) const {
        const double x = parameters[0][0];

        residuals[0] = 10 - x; // r(x) = 10 - x

        if(jacobians != NULL && jacobians[0] != NULL) {
            jacobians[0][0] = -1; // r'(x) = -1
        }

        return true;
    }
};
```


## Part 2: AddResidualBlock

* 声明 `ceres::Problem problem;`
* 通过 `AddResidualBlock` 将 **代价函数(cost function)、损失函数(loss function) 和 待优化状态量** 添加到 `problem`

```c++
ceres::CostFunction *cost_function;
cost_function = new ceres::AutoDiffCostFunction<CostFunctor, 1, 1>(new CostFunctor);

ceres::Problem problem;
problem.AddResidualBlock(cost_function, NULL, &x);
```

## Part 3: Config & Solve

配置求解器，并计算，输出结果

```c++
ceres::Solver::Options options;
options.max_num_iterations = 25;
options.linear_solver_type = ceres::DENSE_QR;
options.minimizer_progress_to_stdout = true;

ceres::Solver::Summary summary;
ceres::Solve(options, &problem, &summary);
std::cout << summary.BriefReport() << "\n";
```

## Simple Example Code

```c++
#include "ceres/ceres.h"
#include "glog/logging.h"

struct CostFunctor {
    template<typename T>
    bool operator()(const T *const x, T *residual) const {
        residual[0] = 10.0 - x[0]; // f(x) = 10 - x
        return true;
    }
};

struct CostFunctorNum {
    bool operator()(const double *const x, double *residual) const {
        residual[0] = 10.0 - x[0]; // f(x) = 10 - x
        return true;
    }
};

class SimpleCostFunctor : public ceres::SizedCostFunction<1,1> {
public:
    virtual ~SimpleCostFunctor() {};

    virtual bool Evaluate(
      double const* const* parameters, double *residuals, double **jacobians) const {
        const double x = parameters[0][0];

        residuals[0] = 10 - x; // f(x) = 10 - x

        if(jacobians != NULL && jacobians[0] != NULL) {
            jacobians[0][0] = -1; // f'(x) = -1
        }

        return true;
    }
};

int main(int argc, char** argv) {
    google::InitGoogleLogging(argv[0]);

    double x = 0.5;
    const double initial_x = x;

    ceres::Problem problem;

    // Set up the only cost function (also known as residual)
    ceres::CostFunction *cost_function;

    // auto-differentiation
//    cost_function = new ceres::AutoDiffCostFunction<CostFunctor, 1, 1>(new CostFunctor);

     //numeric differentiation
//    cost_function =
//    new ceres::NumericDiffCostFunction<CostFunctorNum, ceres::CENTRAL, 1, 1>(
//      new CostFunctorNum);

    cost_function = new SimpleCostFunctor;

    // 添加代价函数cost_function和损失函数NULL，其中x为状态量
    problem.AddResidualBlock(cost_function, NULL, &x);

    ceres::Solver::Options options;
    options.minimizer_progress_to_stdout = true;

    ceres::Solver::Summary summary;
    ceres::Solve(options, &problem, &summary);

    std::cout << summary.BriefReport() << "\n";
    std::cout << "x : " << initial_x << " -> " << x << "\n";

    return 0;
}
```


# 应用: 基于李代数的视觉SLAM位姿优化

下面以 **基于李代数的视觉SLAM位姿优化问题** 为例，介绍 Ceres Solver 的使用。

（1）残差（预测值 - 观测值）

$$
r(\xi) = K \exp({\xi}^{\wedge}) P - u
$$

（2）雅克比矩阵

$$
\begin{aligned}
J
&= \frac{\partial r(\xi)}{\partial \xi} \\
&=
\begin{bmatrix}
\frac{f_x}{Z'} & 0 & -\frac{X'f_x}{Z'^2} &
-\frac{X'Y'f_x}{Z'^2} & f_x+\frac{X'^2f_x}{Z'^2} & -\frac{Y'f_x}{Z'} \\
0 & \frac{f_y}{Z'} & -\frac{Y'f_y}{Z'^2} &
-f_y-\frac{Y'^2f_y}{Z'^2} & \frac{X'Y'f_y}{Z'^2} & \frac{X'f_y}{Z'}
\end{bmatrix}  \in \mathbb{R}^{2 \times 6}
\end{aligned}
$$

* 雅克比矩阵的具体求导，可参考我的另一篇博客 [视觉SLAM位姿优化时误差函数雅克比矩阵的计算](https://blog.csdn.net/u011178262/article/details/85016981)

（3）核心代码

代价函数的构造：

```c++
class BAGNCostFunctor : public ceres::SizedCostFunction<2, 6> {
public:
    EIGEN_MAKE_ALIGNED_OPERATOR_NEW

    BAGNCostFunctor(Eigen::Vector2d observed_p, Eigen::Vector3d observed_P) :
            observed_p_(observed_p), observed_P_(observed_P) {}

    virtual ~BAGNCostFunctor() {}

    virtual bool Evaluate(
      double const* const* parameters, double *residuals, double **jacobians) const {

        Eigen::Map<const Eigen::Matrix<double,6,1>> T_se3(*parameters);

        Sophus::SE3 T_SE3 = Sophus::SE3::exp(T_se3);

        Eigen::Vector3d Pc = T_SE3 * observed_P_;

        Eigen::Matrix3d K;
        double fx = 520.9, fy = 521.0, cx = 325.1, cy = 249.7;
        K << fx, 0, cx, 0, fy, cy, 0, 0, 1;

        Eigen::Vector2d residual =  (K * Pc).hnormalized() - observed_p_;

        residuals[0] = residual[0];
        residuals[1] = residual[1];

        if(jacobians != NULL) {

            if(jacobians[0] != NULL) {

                Eigen::Map<Eigen::Matrix<double, 2, 6, Eigen::RowMajor>> J(jacobians[0]);

                double x = Pc[0];
                double y = Pc[1];
                double z = Pc[2];

                double x2 = x*x;
                double y2 = y*y;
                double z2 = z*z;

                J(0,0) =  fx/z;
                J(0,1) =  0;
                J(0,2) = -fx*x/z2;
                J(0,3) = -fx*x*y/z2;
                J(0,4) =  fx+fx*x2/z2;
                J(0,5) = -fx*y/z;
                J(1,0) =  0;
                J(1,1) =  fy/z;
                J(1,2) = -fy*y/z2;
                J(1,3) = -fy-fy*y2/z2;
                J(1,4) =  fy*x*y/z2;
                J(1,5) =  fy*x/z;
            }
        }

        return true;
    }

private:
    const Eigen::Vector2d observed_p_;
    const Eigen::Vector3d observed_P_;
};
```

构造优化问题，并求解相机位姿：

```c++
Sophus::Vector6d se3;

ceres::Problem problem;
for(int i=0; i<n_points; ++i) {
    ceres::CostFunction *cost_function;
    cost_function = new BAGNCostFunctor(p2d[i], p3d[i]);
    problem.AddResidualBlock(cost_function, NULL, se3.data());
}

ceres::Solver::Options options;
options.dynamic_sparsity = true;
options.max_num_iterations = 100;
options.sparse_linear_algebra_library_type = ceres::SUITE_SPARSE;
options.minimizer_type = ceres::TRUST_REGION;
options.linear_solver_type = ceres::SPARSE_NORMAL_CHOLESKY;
options.trust_region_strategy_type = ceres::DOGLEG;
options.minimizer_progress_to_stdout = true;
options.dogleg_type = ceres::SUBSPACE_DOGLEG;

ceres::Solver::Summary summary;
ceres::Solve(options, &problem, &summary);
std::cout << summary.BriefReport() << "\n";

std::cout << "estimated pose: \n" << Sophus::SE3::exp(se3).matrix() << std::endl;
```
