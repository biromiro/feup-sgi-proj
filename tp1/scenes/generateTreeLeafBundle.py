import numpy as np
import itertools as it
import sys
from scipy import spatial as sp


def generateTreeBundlePoint():
    x = np.random.normal()
    y = np.random.normal()
    z = np.random.normal()

    x = x / np.sqrt(x**2 + y**2 + z**2)
    y = y / np.sqrt(x**2 + y**2 + z**2)
    z = z / np.sqrt(x**2 + y**2 + z**2)

    return (x, y, z)


def genTriangles(points):
    """Generate the n nearest points to the origin"""
    return [tuple(point) for point in sp.ConvexHull(points).simplices]


def generateBundle(numPoints, typeOfBundle):
    """Generate a bundle"""

    points = []

    while(len(points) < numPoints):
        point = generateTreeBundlePoint()
        if (point not in points):
            points.append(point)

    leafTriangles = genTriangles(points)

    for idx, trio in enumerate(leafTriangles):
        (x1, y1, z1) = points[trio[0]]
        (x2, y2, z2) = points[trio[1]]
        (x3, y3, z3) = points[trio[2]]
        print(
            f"<primitive id=\"{typeOfBundle}Triangle{idx}\"> \n\t<triangle x1=\"{x1}\" y1=\"{y1}\" z1=\"{z1}\" x2=\"{x2}\" y2=\"{y2}\" z2=\"{z2}\" x3=\"{x3}\" y3=\"{y3}\" z3=\"{z3}\" /> \n</primitive>")

    print("\n\n\n")
    print(f"<component id=\"{typeOfBundle}\"> \n\t<transformation>\n\t</transformation>\n\t<materials>\n\t\t<material id=\"inherit\" />\n\t</materials>\n\t<texture id=\"none\" />\n\t<children>")

    for idx, _ in enumerate(leafTriangles):
        print(f"\t\t<primitiveref id=\"{typeOfBundle}Triangle{idx}\" />")

    print("\t </children >\n </component >")


generateBundle(int(sys.argv[1]), sys.argv[2])
