---
layout: article
title:  "Image Exposure Controller"
date:   2022-06-22
tags: ComputerVision 3A
key: cv-image-exposure-controller
---

* ref
  - [https://github.com/KumarRobotics/msckf_vio/issues/41#issuecomment-398810737](https://github.com/KumarRobotics/msckf_vio/issues/41#issuecomment-398810737)

  - [vo-autoexpose](https://github.com/MIT-Bilab/vo-autoexpose): An auto-exposure algorithm for maxing out VO performance in challenging light conditions

* code: https://github.com/cggos/ccv/blob/master/apps/camkit/rs_cam/py/rs_app.py

The auto exposure code is not open source because for one the actual implementation is ugly, and second because it ties into other software that is not open sourced.

Here a few (edited) notes that I sent to somebody who asked about how it works:

- what we implemented is super simple but works well in practice:

  $$
    \text{new\_shutter\_time} = \text{current\_shutter\_time} \cdot \frac{\text{desired\_brightness}}{\text{current\_brightness}} 
  $$
    
  You can go fancier by implementing
    
  $$
    \text{new\_shutter\_time} = \text{current\_shutter\_time} \cdot \left(\frac{\text{desired\_brightness}}{\text{current\_brightness}}\right)^\alpha
  $$ 
    
  $\alpha \leq 1$, but in practice $\alpha = 1$ works just fine.

- **brightness** is computed from **every 16th row and column**, so in fact only 1 out of every 256 is used for brightness computation

- threshold on brightness:
    
  we only change shutter time if 
  
  $$
    |\text{desired\_brightness} - \text{current\_brightness}| > \text{threshold}
  $$
    
  This is so that we don't torture the ptgrey cameras with constant shutter speed changes.
    
- region of interest (ROI) support: we **compute brighness only from the bottom X%**. Typically **X=70**, so we will ignore the top 30% of the image, because that's often where the sun or sky are, and where we don't usually pick up features.

- **configurable max shutter limit**: the max shutter time is the min of the shutter time imposed by frame rate, and a configurable hard shutter limit (in case we get motion blur and decide we'd **rather live with a darker image and/or gain noise than the motion blur**).

- **auto gain**: once we hit max shutter, we turn on auto gain (and when it get's brighter again, we take the gain off first, then decrease shutter).

So

$$
\text{if} \; \left| \bar{B} - B_c \right| > B_{th}: \\ \; T_s \leftarrow T_s \cdot \frac{\bar{B}}{B_c} \\ \; \text{if} \; T_s < T_{min}: \\ \text{auto gain}
$$