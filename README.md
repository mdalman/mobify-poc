# mobify-poc

Notes about resolution and quality:

-2X, 3X, 4X images can be compressed more than 1X images before you see compression artifacts (the compression artifacts are smaller)
-Create a table of pixel ratios to qualities
-If you allow zoom on a highly compressed image, you will see compression artifacts
-Proposed solution: in places where you want users to be able to zoom, put data-zoom=true on the image, imageload.js will look at this when determining the quality to request from the image proxy.

Table of values might look like this:

                 //pixelRatio:Quality
                 var qualities = {4:{'zoom':55,'noZoom':30},
                                  3:{'zoom':60,'noZoom':35},
                                  2:{'zoom':65,'noZoom':40},
                                  1:{'zoom':70,'noZoom':45}}

