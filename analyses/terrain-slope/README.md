# Calculating terrain slope

This example is meant to showcase some of the most common use cases of storing results
of analysis in Forma.

We perform a terrain slope analysis, and store the result in Forma's extension storage.

You can save the steepness threshold as JSON, the analysis results as a base64 encoded png, and also
the raw terrain slope as an `arrayBuffer`. We also save some metadata on the object to further
optimize the drawing process, without making it necessary to fetch the terrain triangles if you have
already done the calculations.

Should look something like this when it's calculated.

![Terrain slope](/analyses/terrain-slope/terrain-slope.png)
