## 問題
巡回セールスマン問題

> 巡回セールスマン問題（じゅんかいセールスマンもんだい、英: traveling salesman problem、TSP）は、都市の集合と各2都市間の移動コスト（たとえば距離）が与えられたとき、全ての都市をちょうど一度ずつ巡り出発地に戻る巡回路のうちで総移動コストが最小のものを求める（セールスマンが所定の複数の都市を1回だけ巡回する場合の最短経路を求める）組合せ最適化問題である。

(wiki [^1] より引用)

## 入出力

### 入力

```
N
x_0 y_0
.
.
.
x_(N-1) y_(N-1)
```

1行目の N は頂点の数です。  
続く N 行には各頂点の座標 x, y が与えられます。  
入力値はすべて整数です。

### 出力

巡る頂点の順に頂点の index を出力してください。

```
p_0 ... p_N 
```

[^1]: Wikipedia - 巡回セールスマン問題 (https://ja.wikipedia.org/wiki/%E5%B7%A1%E5%9B%9E%E3%82%BB%E3%83%BC%E3%83%AB%E3%82%B9%E3%83%9E%E3%83%B3%E5%95%8F%E9%A1%8C)