---
layout: article
title:  "YUV(NV21)图像数据到RGB颜色空间的转换"
date:   2018-11-18
tags: ComputerVision
key: image-yuv-rgb
---

[TOC]

本文主要介绍YUV_NV21颜色空间到RGB(BGR in OpenCV)颜色空间的转换，并给出示例代码，另附YUV图像查看工具。  

## NV21(YUV420)介绍

NV12和NV21属于YUV420格式（每2x2四个Y，共用一组uv），是一种two-plane模式，即Y和UV分为两个Plane，但是UV（CbCr）为交错存储，而不是分为三个plane。先存储所有的Y，然后UV交错存储：NV12先U后V，NV21先V后U。  

YUV420sp示例格式如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20181118160634522.png)

## YUV_NV21转BGR代码

YUV_NV21颜色空间到RGB(BGR in OpenCV)颜色空间的转换示例代码如下：
```c++
const int width  = 1280;
const int height = 800;

std::ifstream file_in;
file_in.open("../image_yuv_nv21_1280_800_01.raw", std::ios::binary);
std::filebuf *p_filebuf = file_in.rdbuf();
size_t size = p_filebuf->pubseekoff(0, std::ios::end, std::ios::in);
p_filebuf->pubseekpos(0, std::ios::in);

char *buf_src = new char[size];
p_filebuf->sgetn(buf_src, size);

cv::Mat mat_src = cv::Mat(height*1.5, width, CV_8UC1, buf_src);
cv::Mat mat_dst = cv::Mat(height, width, CV_8UC3);

cv::cvtColor(mat_src, mat_dst, cv::COLOR_YUV2BGR_NV21);
```
转换出的（正确）效果如下：  

![在这里插入图片描述](https://img-blog.csdnimg.cn/20181118161456907.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTExNzgyNjI=,size_16,color_FFFFFF,t_70)

接下来，我自己按如下逻辑实现该算法，替换掉 OpenCV的 `cv::cvtColor(mat_src, mat_dst, cv::COLOR_YUV2BGR_NV21)`  

* 从内存中读取出每个像素的YUV，即 YUV420 --> YUV444
* 根据 YUV --> RGB 公式，计算出RGB值
* 按 BGR888 的内存分布格式，将RGB值写入内存传给 `cv::Mat`
* 保存图片到本地显示

实现代码如下：

```c++
void yuv_nv21_to_rgb(unsigned char rgb[], char yuv[], int width, int height) {

    int total = width * height;
    char Y, U, V;
    unsigned char R, G, B;
    int index = 0;

    for (int h = 0; h < height; h++) {
        for (int w = 0; w < width; w++) {

            Y = yuv[h * width + w];
            if ((w & 1) == 0)
                V = yuv[total + (h >> 1) * width + w];
            if ((w & 1) == 1)
                U = yuv[total + (h >> 1) * width + w - 1];

            // OpenCV YCrCb --> RGB
            //B = Y + 1.773*(U-128);
            //G = Y - 0.714*(V-128) - 0.344*(U-128);
            //R = Y + 1.403*(V-128);

            // YUV-->RGB for HDTV(BT.601)
            //B = Y + 2.03211*(U-128);
            //G = Y - 0.39465*(U-128) - 0.5806*(V-128);
            //R = Y + 1.13983*(V-128);

            // YUV-->RGB for HDTV(BT.709)
            //B = Y + 2.12798*(U-128);
            //G = Y - 0.21482*(U-128) - 0.38059*(V-128);
            //R = Y + 1.28033*(V-128);

            // YCbCr-->RGB
            B = 1.164*(Y-16) + 2.018*(U-128);
            G = 1.164*(Y-16) - 0.813*(U-128) - 0.391*(V-128);
            R = 1.164*(Y-16) + 1.596*(V-128);

            if (R < 0) R = 0; else if (R > 255) R = 255;
            if (G < 0) G = 0; else if (G > 255) G = 255;
            if (B < 0) B = 0; else if (B > 255) B = 255;

            rgb[index++] = B;
            rgb[index++] = G;
            rgb[index++] = R;
        }
    }
}
```

该代码中试了几种 YUV --> RGB 的算法，效果最好的即上面使用（未注释）的代码，转换结果如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20181119214222536.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTExNzgyNjI=,size_16,color_FFFFFF,t_70)

欢迎各位同学指正，找出效果不好的原因，并解决问题，谢谢～

* 在StackOverflow回答的问题：[Converting YUV into BGR or RGB in OpenCV](https://stackoverflow.com/questions/7954416/converting-yuv-into-bgr-or-rgb-in-opencv/53357874#53357874)
* 整个工程可参见我的Github工程：https://github.com/chenguang055/cgocv_app/tree/master/image_convertor ，可在此提交 Issue
* 本代码 **测试yuv raw图像** 可在此下载：https://download.csdn.net/download/u011178262/10791506

## YUV图像 查看工具

* [RAW pixels viewer (online)](http://rawpixels.net/)
* [vooya](http://www.offminor.de/)
* [Datahammer 7yuv (windows)](http://datahammer.de/)
