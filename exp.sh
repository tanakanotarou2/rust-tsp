#!/bin/bash

function run_batch(){
  INPUT_DIR="inputs/ume/"

  inputs[1]="a280.dat"
  inputs[2]="berlin52.dat"
  inputs[3]="eil51.dat"
  inputs[4]="eil76.dat"
  inputs[5]="eil101.dat"
  inputs[6]="kroA100.dat"
  inputs[7]="kroC100.dat"
  inputs[8]="kroD100.dat"
  inputs[9]="lin105.dat"
  inputs[10]="pr76.dat"
  inputs[11]="pr1002.dat"
  inputs[12]="st70.dat"

  ARG1=$1
  ARG2=$2
  INPUT_DATA="${INPUT_DIR}/${inputs[ARG1]}"
  OUTPUT_FILE="output/${ARG2}.csv"

  # cargo run を実行
  RES=`bash -c "cargo run -q -r --features exp < ${INPUT_DATA} 2>/dev/null"`
  echo -e "${inputs[ARG1]}\t${RES}" >> $OUTPUT_FILE

}

d=$(date '+%Y-%m-%d_%H-%M-%S')

# マルチプロセスで実行
# xargs の -p でプロセス数を設定
# 参考サイト: http://kei0310.info/?p=610
export -f run_batch
seq 1 12 |
xargs -L 1 -P 14 -I {} bash -c "run_batch {} ${d}"
