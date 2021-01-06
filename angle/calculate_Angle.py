# -*- coding: utf-8 -*
import os
import json
import math
import numpy
import csv


# 先加载文件里的坐标
def extracting_coordinate(fileName):
    # 先提取坐标
    preArr = []
    preArr_all = []
    actArr = []
    actArr_all = []
    for line in open("D:/wamp64/www/RGN-Model/data/file/"+fileName+"/"+fileName+"_Predicted.pdb"):
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
    for line in open("D:/wamp64/www/RGN-Model/data/file/"+fileName+"/"+fileName+"_Actual.pdb"):
        columns = line.split()
        if (line[0:4] == "ATOM" and line[21:22] == "A" and line[13:14] == "N") or \
                (line[0:4] == "ATOM" and line[21:22] == "A" and line[13:15] == "CA") or \
                (line[0:4] == "ATOM" and line[21:22] == "A" and line[13:14] == "C"):
            # print columns[2],columns[3],columns[6],columns[7],columns[8]
            actArr.append(float(columns[6]))
            actArr.append(float(columns[7]))
            actArr.append(float(columns[8]))
            if len(actArr) == 3:
                actArr_all.append(actArr)
                actArr = []
    return (numpy.array(preArr_all)), (numpy.array(actArr_all))
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
# 开始提取距离矩阵
# 遍历文件夹下所有文件
path="C:/Users/xuyang/Desktop/1/new PDB"
dirs=os.listdir(path)
FName=[]
coordinate1=[]
for file in dirs:
    FName.append(file)
print (FName)
for b in range(len(FName)):
    os.mkdir('C:/Users/xuyang/Desktop/NEW_Angel/'+FName[b])
for a in range(len(FName)):
    # 提取各原子坐标
    P ,Q= extracting_coordinate(FName[a])
    angel = []
    preAngel=[]
    actAngel=[]
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
    # 真实结构计算
    tempAct = []
    for m in range(0, len(Q), 3):
        if (m - 1 < 0):
            tempAct.append(None)
            continue
        if (m > len(Q)):
            break
        pre_C = Q[m - 1]
        N = Q[m]
        CA = Q[m + 1]
        C = Q[m + 2]
        temp_phi = find_angle(pre_C, N, CA, C)
        if (temp_phi != None):
            temp_phi = round(temp_phi, 3)
        tempAct.append(temp_phi)
    actAngel.append(tempAct)
    tempAct = []
    for n in range(0, len(Q), 3):
        if n >= len(Q) - 3:
            tempAct.append(None)
            break
        pre_N = Q[n]
        pre_CA = Q[n + 1]
        pre_C = Q[n + 2]
        N = Q[n + 3]
        temp_psi = find_angle(pre_N, pre_CA, pre_C, N)
        if temp_psi != None:
            temp_psi = round(temp_psi, 3)
        # temp_psi = find_angle(P[i],P[i+1],P[i+2],P[i+3])

        tempAct.append(temp_psi)
        # temp.append(temp_psi)
    actAngel.append(tempAct)
    #合起来
    angel.append(preAngel)
    angel.append(actAngel)
    AllAngel = []
    AllAngel_temp_pre = []
    AllAngel_temp_act = []
    for l in range(len(preAngel[0])):
        AllAngel_temp_pre.append([preAngel[0][l],preAngel[1][l],"allowed"])
        AllAngel_temp_act.append([actAngel[0][l],actAngel[1][l],"allowed"])
    AllAngel.append(AllAngel_temp_pre)
    AllAngel.append(AllAngel_temp_act)
    # print(len(AllAngel_temp_pre))
    # print(len(AllAngel_temp_act))
    # print(AllAngel)
    # break
    with open("C:/Users/xuyang/Desktop/NEW_Angel/"+FName[a]+"/"+FName[a]+"_NEW_Angel.json",
              "w") as f:
        json.dump(AllAngel, f)
    print(FName[a]+" 扭转角数据加载完成！")
