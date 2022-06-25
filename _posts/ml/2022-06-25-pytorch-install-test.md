---
layout: article
title:  "PyTorch on Ubuntu 18.04"
tags: MachineLearning PyTorch
key: ml-pytorch
---

[TOC]

# Install PyTorch locally

* https://pytorch.org/get-started/locally/

<p align="center">
  <img src="../images/ml/dl_pytorch.png">
</p>

## Conda (Python)

```sh
conda create -n torch python=3.9
conda activate torch

# select one
conda install pytorch -c soumith 
conda install pytorch torchvision cuda80 -c soumith
conda install pytorch==1.0.0 torchvision==0.2.1 cuda80 -c pytorch

# PyTorch 1.10
conda install pytorch torchvision torchaudio cudatoolkit=10.2 -c pytorch
```

test

```sh
python
> import torch
```

## Pip (Python)

```sh
pip install torchvision==0.4.0 -f https://download.pytorch.org/whl/torch_stable.html

pip uninstall torchvision
```

## LibTorch (C++)

* Dowload the prebuilt libs

  ```cmake
  set(CMAKE_PREFIX_PATH "<path>/libtorch/share/cmake/Torch")
  ```

* Build from Source

  ```sh
  # example
  git clone --recursive -b v1.0.1 https://github.com/pytorch/pytorch

  cd pytorch
  mkdir build
  cd build

  # options
  export NO_CUDA=1
      
  python ../tools/build_libtorch.py
  ```

  The built libtorch library is located at `pytorch/torch/lib/tmp_install/` in default.

  ```cmake
  set(Torch_DIR "<path>/pytorch/torch/lib/tmp_install/share/cmake/Torch/")
  ```

* use with cmake

  ```cmake
  find_package(Torch REQUIRED)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${TORCH_CXX_FLAGS}")
  target_link_libraries(<target> ${TORCH_LIBRARIES})
  ```

# PyTorch 模型文件

- PyTorch的模型文件一般会保存为 **.pth** 文件，C++接口一般读取的是 **.pt** 文件
- **.pth** 文件通过 `torch.jit.trace` 转换后得到 **.pt** 文件

**只保存模型参数，不保存模型结构**

```cpp
// 保存
torch.save(model.state_dict(), mymodel.pth) // 只保存模型权重参数，不保存模型结构

// 调用
model = My_model(*args, **kwargs)  // 这里需要重新模型结构，My_model
model.load_state_dict(torch.load(mymodel.pth)) // 这里根据模型结构，调用存储的模型参数
model.eval()
```

**保存整个模型，包括模型结构+模型参数**

```cpp
// 保存
torch.save(model, mymodel.pth)  // 保存整个model的状态

// 调用
model=torch.load(mymodel.pth)  // 这里已经不需要重构模型结构了，直接load就可以
model.eval()
```

# FAQ

> UserWarning: CUDA initialization: CUDA unknown error - this may be due to an incorrectly set up environment, e.g. changing env variable CUDA_VISIBLE_DEVICES after program start. Setting the available devices to be zero

```sh
# works for me
sudo rmmod nvidia_uvm
sudo modprobe nvidia_uvm
```