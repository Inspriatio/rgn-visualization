# -*- coding: utf-8 -*
import os
import json
import math
import numpy
import csv


# 先加载文件里的坐标
def extracting_coordinate():
    # 先提取坐标
    preArr = []
    preArr_all = []
    actArr = []
    actArr_all = []
    for line in open("C:/Users/xuyang/Desktop/1/1sa1/1sa1.pdb"):
        columns = line.split()
        if (line[0:4] == "ATOM" and line[21:22] == "A" and line[13:14] == "N") or\
                (line[0:4] == "ATOM" and line[21:22] == "A" and line[13:15] == "CA") or \
                (line[0:4] == "ATOM" and line[21:22] == "A" and line[13:14] == "C"):
            # print columns[2],columns[3],columns[6],columns[7],columns[8]
            preArr.append(float(columns[6]))
            preArr.append(float(columns[7]))
            preArr.append(float(columns[8]))
            if len(preArr) == 3:
                preArr_all.append(preArr)
                preArr = []
    return numpy.array(preArr_all)
    # return numpy.array(preArr_all)
# 计算扭转角
def find_angle(p1, p2, p3, p4):
    q1 = p2 - p1
    q2 = p3 - p2
    q3 = p4 - p3
    if q1[0] != 0 and q1[1] != 0 and q1[2] != 0 and q2[0]!=0 and q2[1]!=0 and q2[2]!=0 and q3[0]!=0 and q3[1]!=0 and q3[2]!=0:
        n1 = numpy.cross(q1, q2)
        n2 = numpy.cross(q2, q3)

        n1 = n1 / numpy.sqrt(numpy.sum(n1 * n1))
        n2 = n2 / numpy.sqrt(numpy.sum(n2 * n2))

        q2 = q2 / numpy.sqrt(numpy.sum(q2 * q2))
        n3 = numpy.cross(n1, n2)
        n3 = n3 / numpy.sqrt(numpy.sum(n3 * n3))

        angle = numpy.arccos(numpy.sum(n1 * n2)) * numpy.sign(numpy.sum(q2 * n3))
        return angle * 57.3
    else:
        return None

# 主函数
# 提取各原子坐标
P = extracting_coordinate()
angel = []
preAngel=[]
# 预测结构计算
tempPre = []
for i in range(0, len(P), 3):
        if (i - 1 < 0):
            tempPre.append(None)
            continue
        if (i > len(P)):
            break
        pre_C = P[i - 1]
        N = P[i]
        CA = P[i + 1]
        C = P[i + 2]
        temp_phi = find_angle(pre_C, N, CA, C)
        if(temp_phi !=None):
            temp_phi = round(temp_phi, 3)
        tempPre.append(temp_phi)
preAngel.append(tempPre)
tempPre=[]
for j in range(0, len(P), 3):
        if j >= len(P)-3:
            tempPre.append(None)
            break
        pre_N = P[j]
        pre_CA = P[j + 1]
        pre_C = P[j + 2]
        N = P[j + 3]
        temp_psi = find_angle(pre_N, pre_CA, pre_C, N)
        if temp_psi != None:
            temp_psi = round(temp_psi,3)
        # temp_psi = find_angle(P[i],P[i+1],P[i+2],P[i+3])

        tempPre.append(temp_psi)
        # temp.append(temp_psi)
preAngel.append(tempPre)
tempPre = []
for k in range(0, len(P), 3):
        if k - 2 < 0:
            tempPre.append(None)
            continue
        if (k > len(P)):
            break
        pre_CA = P[k - 2]
        pre_C = P[k - 1]
        N = P[k]
        CA = P[k + 1]
        temp_omega = find_angle(pre_CA, pre_C, N, CA)
        if temp_omega != None:
            temp_psi = round(temp_omega, 3)
        # temp_psi = find_angle(P[i],P[i+1],P[i+2],P[i+3])

        tempPre.append(temp_omega)
        # temp.append(temp_psi)
preAngel.append(tempPre)

with open("C:/Users/xuyang/Desktop/1/1sa1/1sa1_NEW_Angel.json",
            "w") as f:
    json.dump(preAngel, f)
print("1sa1扭转角数据加载完成！")
