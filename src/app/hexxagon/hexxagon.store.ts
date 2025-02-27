import { computed, Injectable, signal } from "@angular/core";
import { BoardCell } from "./hexxagon.type";

const initCells: BoardCell[][] = [
  [{ id: 1, row: 1, col: 1, show: false }, { id: 2, row: 1, col: 2, show: false }, { id: 3, row: 1, col: 3, show: true, player: 2 }, { id: 4, row: 1, col: 4, show: false }, { id: 5, row: 1, col: 5, show: false }],
  [{ id: 6, row: 2, col: 1, show: false }, { id: 7, row: 2, col: 2, show: true }, { id: 8, row: 2, col: 3, show: true }, { id: 9, row: 2, col: 4, show: false }, { id: 10, row: 2, col: 5, show: false }],
  [{ id: 11, row: 3, col: 1, show: false }, { id: 12, row: 3, col: 2, show: true }, { id: 13, row: 3, col: 3, show: true }, { id: 14, row: 3, col: 4, show: true }, { id: 15, row: 3, col: 5, show: false }],
  [{ id: 16, row: 4, col: 1, show: true }, { id: 17, row: 4, col: 2, show: true }, { id: 18, row: 4, col: 3, show: true }, { id: 19, row: 4, col: 4, show: true }, { id: 20, row: 4, col: 5, show: false }],
  [{ id: 21, row: 5, col: 1, show: true, player: 1 }, { id: 22, row: 5, col: 2, show: true }, { id: 23, row: 5, col: 3, show: true }, { id: 24, row: 5, col: 4, show: true }, { id: 25, row: 5, col: 5, show: true, player: 1 }],
  [{ id: 26, row: 6, col: 1, show: true }, { id: 27, row: 6, col: 2, show: true }, { id: 28, row: 6, col: 3, show: true }, { id: 29, row: 6, col: 4, show: true }, { id: 30, row: 6, col: 5, show: false }],
  [{ id: 31, row: 7, col: 1, show: true }, { id: 32, row: 7, col: 2, show: true }, { id: 33, row: 7, col: 3, show: false }, { id: 34, row: 7, col: 4, show: true }, { id: 35, row: 7, col: 5, show: true }],
  [{ id: 36, row: 8, col: 1, show: true }, { id: 37, row: 8, col: 2, show: true }, { id: 38, row: 8, col: 3, show: true }, { id: 39, row: 8, col: 4, show: true }, { id: 40, row: 8, col: 5, show: false }],
  [{ id: 41, row: 9, col: 1, show: true }, { id: 42, row: 9, col: 2, show: true }, { id: 43, row: 9, col: 3, show: true }, { id: 44, row: 9, col: 4, show: true }, { id: 45, row: 9, col: 5, show: true }],
  [{ id: 46, row: 10, col: 1, show: true }, { id: 47, row: 10, col: 2, show: false }, { id: 48, row: 10, col: 3, show: false }, { id: 49, row: 10, col: 4, show: true }, { id: 50, row: 10, col: 5, show: false }],
  [{ id: 51, row: 11, col: 1, show: true }, { id: 52, row: 11, col: 2, show: true }, { id: 53, row: 11, col: 3, show: true }, { id: 54, row: 11, col: 4, show: true }, { id: 55, row: 11, col: 5, show: true }],
  [{ id: 56, row: 12, col: 1, show: true }, { id: 57, row: 12, col: 2, show: true }, { id: 58, row: 12, col: 3, show: true }, { id: 59, row: 12, col: 4, show: true }, { id: 60, row: 12, col: 5, show: false }],
  [{ id: 61, row: 13, col: 1, show: true, player: 2 }, { id: 62, row: 13, col: 2, show: true }, { id: 63, row: 13, col: 3, show: true }, { id: 64, row: 13, col: 4, show: true }, { id: 65, row: 13, col: 5, show: true, player: 2 }],
  [{ id: 66, row: 14, col: 1, show: true }, { id: 67, row: 14, col: 2, show: true }, { id: 68, row: 14, col: 3, show: true }, { id: 69, row: 14, col: 4, show: true }, { id: 70, row: 14, col: 5, show: false }],
  [{ id: 71, row: 15, col: 1, show: false }, { id: 72, row: 15, col: 2, show: true }, { id: 73, row: 15, col: 3, show: true }, { id: 74, row: 15, col: 4, show: true }, { id: 75, row: 15, col: 5, show: false }],
  [{ id: 76, row: 16, col: 1, show: false }, { id: 77, row: 16, col: 2, show: true }, { id: 78, row: 16, col: 3, show: true }, { id: 79, row: 16, col: 4, show: false }, { id: 80, row: 16, col: 5, show: false }],
  [{ id: 81, row: 17, col: 1, show: false }, { id: 82, row: 17, col: 2, show: false }, { id: 83, row: 17, col: 3, show: true, player: 1 }, { id: 84, row: 17, col: 4, show: false }, { id: 85, row: 17, col: 5, show: false }],
]

@Injectable()
export class HexxagonStore {
    // 标记当前出招的玩家
    currentPlayer = signal<1 | 2>(1);
    // 标记第一次被点击的ID
    clickedId = signal<number>(0);

    step = signal<number>(0); // 0:表示第一步选择棋子，1:表示第二步操作棋子

    // 标记第一次被点击的cell的相邻cell
    clickedFirst = signal<number[]>([]);
    clickedSecond = signal<number[]>([]);

    cells = signal<BoardCell[][]>(initCells.map(row => row.map(cell => ({ ...cell }))));

    player1Count = computed(() => {
      let count = 0;
      for (const row of this.cells()) {
        for (const cell of row) {
          if (cell.player === 1) {
            count++;
          }
        }
      }
      return count;
    });
    player2Count = computed(() => {
      let count = 0;
      for (const row of this.cells()) {
        for (const cell of row) {
          if (cell.player === 2) {
            count++;
          }
        }
      }
      return count;
    });
    player1Percent = computed(() => {
      return Number((this.player1Count() / (this.player1Count() + this.player2Count()) * 100).toFixed(2));
    });
    player2Percent = computed(() => {
      return Number((this.player2Count() / (this.player1Count() + this.player2Count()) * 100).toFixed(2));
    });

    winner = computed(() => {
      // 如果其中一方棋子被吃光
      if (this.player1Count() === 0 || this.player2Count() === 0) {
        return this.player1Count() === 0 ? 2 : 1;
      }
      // 如果棋盘已满
      if (this.player1Count() + this.player2Count() == this.availableCells().size) {
        if (this.player1Count() == this.player2Count()) {
          // 平局
          return 0;
        } else if (this.player1Count() > this.player2Count()) {
          // 玩家1获胜
          return 1;
        } else {
          // 玩家2获胜
          return 2;
        }
      }
      // 没有结束
      return -1;
    });

    // 可点击的所有的cell
    availableCells = computed(() => {
      const cells = this.cells();
      const map = new Map<number, BoardCell>();
      for (const arr of cells) {
        for (const cell of arr) {
          if (cell.show) {
            map.set(cell.id, cell);
          }
        }
      }
      return map;
    });


    first = new Map([
      [3, [7, 8, 13]],
      [7, [3, 12, 13, 17]],
      [8, [3, 13, 14, 18]],
      [12, [7, 16, 17, 22]],
      [13, [3, 7, 8, 17, 18, 23]],
      [14, [8, 18, 19, 24]],
      [16, [12, 21, 22, 26]],
      [17, [7, 12, 13, 22, 23, 27]],
      [18, [8, 13, 14, 23, 24, 28]],
      [19, [14, 24, 25, 29]],
      [21, [16, 26, 31]],
      [22, [12, 16, 17, 26, 27, 32]],
      [23, [13, 17, 18, 27, 28]],
      [24, [14, 18, 19, 28, 29, 34]],
      [25, [19, 29, 35]],
      [26, [16, 21, 22, 31, 32, 36]],
      [27, [17, 22, 23, 32, 37]],
      [28, [18, 23, 24, 34, 38]],
      [29, [19, 24, 25, 34, 35, 39]],
      [31, [21, 26, 36, 41]],
      [32, [22, 26, 27, 36, 37, 42]],
      [34, [24, 28, 29, 38, 39, 44]],
      [35, [25, 29, 39, 45]],
      [36, [26, 31, 32, 41, 42, 46]],
      [37, [27, 32, 42, 43]],
      [38, [28, 34, 43, 44]],
      [39, [29, 34, 35, 44, 45, 49]],
      [41, [31, 36, 46, 51]],
      [42, [32, 36, 37, 46, 52]],
      [43, [37, 38, 53]],
      [44, [34, 38, 39, 49, 54]],
      [45, [35, 39, 49, 55]],
      [46, [36, 41, 42, 51, 52, 56]],
      [49, [39, 44, 45, 54, 55, 59]],
      [51, [41, 46, 56, 61]],
      [52, [42, 46, 56, 57, 62]],
      [53, [43, 57, 58, 63]],
      [54, [44, 49, 58, 59, 64]],
      [55, [45, 49, 59, 65]],
      [56, [46, 51, 52, 61, 62, 66]],
      [57, [52, 53, 62, 63, 67]],
      [58, [53, 54, 63, 64, 68]],
      [59, [49, 54, 55, 64, 65, 69]],
      [61, [51, 56, 66]],
      [62, [52, 56, 57, 66, 67, 72]],
      [63, [53, 57, 58, 67, 68, 73]],
      [64, [54, 58, 59, 68, 69, 74]],
      [65, [55, 59, 69, 75]],
      [66, [56, 61, 62, 72]],
      [67, [57, 62, 63, 72, 73, 77]],
      [68, [58, 63, 64, 73, 74, 78]],
      [69, [59, 64, 65, 74, 75, 79]],
      [72, [62, 66, 67, 77]],
      [73, [63, 67, 68, 77, 78, 83]],
      [74, [64, 68, 69, 78]],
      [77, [67, 72, 73, 83]],
      [78, [68, 73, 74, 83]],
      [83, [73, 77, 78]]
    ]);
    second = new Map([
      [3, [12, 14, 17, 18, 23]],
      [7, [8, 16, 18, 22, 23, 27]],
      [8, [7, 17, 19, 23, 24, 28]],
      [12, [3, 13, 21, 23, 26, 27, 32]],
      [13, [12, 14, 22, 24, 27, 28]],
      [14, [3, 13, 23, 25, 28, 29, 34]],
      [16, [7, 17, 27, 31, 32, 36]],
      [17, [3, 8, 16, 18, 26, 28, 32, 37]],
      [18, [3, 7, 17, 27, 19, 29, 34, 38]],
      [19, [8, 18, 28, 34, 35, 39]],
      [21, [12, 22, 32, 36, 41]],
      [22, [7, 13, 21, 23, 31, 36, 37, 42]],
      [23, [3, 7, 8, 12, 14, 22, 24, 32, 34, 37, 38, 43]],
      [24, [8, 13, 23, 25, 35, 38, 39, , 44]],
      [25, [14, 24, 34, 39, 45]],
      [26, [12, 17, 27, 37, 41, 42, 46]],
      [27, [7, 12, 13, 16, 18, 26, 28, 36, 38, 42, 43]],
      [28, [8, 13, 14, 17, 19, 27, 29, 37, 39, 43, 44]],
      [29, [14, 18, 28, 38, 44, 45, 49]],
      [31, [16, 22, 32, 42, 46, 51]],
      [32, [12, 16, 17, 21, 23, 31, 41, 43, 46, 52]],
      [34, [14, 18, 19, 23, 25, 35, 43, 44, 45, 49, 54]],
      [35, [19, 24, 34, 44, 49, 55]],
      [36, [16, 21, 22, 27, 37, 51, 52, 56]],
      [37, [17, 22, 23, 26, 28, 36, 38, 46, 52, 53, 57]],
      [38, [18, 23, 24, 27, 29, 37, 39, 49, 53, 54, 58]],
      [39, [19, 24, 25, 28, 38, 54, 55, 59]],
      [41, [21, 26, 32, 42, 52, 56, 61]],
      [42, [22, 26, 27, 31, 41, 43, 51, 53, 56, 57, 62]],
      [43, [23, 27, 28, 32, 34, 42, 44, 52, 54, 57, 58, 63]],
      [44, [24, 28, 29, 35, 43, 45, 53, 55, 58, 59, 64]],
      [45, [25, 29, 34, 44, 54, 59, 65]],
      [46, [26, 31, 32, 37, 57, 61, 62, 66]],
      [49, [29, 34, 35, 38, 58, 64, 65, 69]],
      [51, [31, 36, 42, 52, 62, 66]],
      [52, [32, 36, 37, 41, 43, 51, 53, 61, 63, 66, 67, 72]],
      [53, [37, 38, 42, 44, 52, 54, 62, 64, 67, 68, 73]],
      [54, [34, 38, 39, 43, 45, 53, 55, 63, 65, 68, 69, 74]],
      [55, [35, 39, 44, 54, 64, 69]],
      [56, [36, 41, 42, 57, 67, 72]],
      [57, [37, 42, 43, 46, 56, 58, 66, 68, 72, 73, 77]],
      [58, [38, 43, 44, 49, 57, 59, 67, 69, 73, 74, 78]],
      [59, [39, 44, 45, 58, 68, 74]],
      [61, [41, 46, 52, 62, 72]],
      [62, [42, 46, 51, 61, 53, 63, 73, 77]],
      [63, [43, 52, 54, 62, 64, 72, 74, 77, 78, 83]],
      [64, [44, 49, 53, 55, 63, 65, 73, 78]],
      [65, [45, 49, 54, 64, 74]],
      [66, [46, 51, 52, 57, 67, 77]],
      [67, [52, 53, 56, 58, 66, 68, 78, 83]],
      [68, [53, 54, 57, 59, 67, 69, 77, 83]],
      [69, [49, 54, 55, 58, 68, 78]],
      [72, [52, 56, 57, 61, 63, 73, 83]],
      [73, [53, 57, 58, 62, 64, 72, 74]],
      [74, [54, 58, 59, 63, 65, 73, 83]],
      [77, [57, 62, 63, 66, 68, 78]],
      [78, [58, 63, 64, 67, 69, 77]],
      [83, [63, 67, 68, 72, 74]],
    ]);


    // 初始化游戏状态
    initState() {
      this.clickedId.set(0);
      this.clickedFirst.set([]);
      this.clickedSecond.set([]);
      this.currentPlayer.set(1);
      this.cells.set(initCells.map(row => row.map(cell => ({ ...cell }))));
      this.step.set(0);
    }


    nextStep() {
      this.step.set((this.step() + 1) % 2);
    }

    getCellById(id: number) {
      for (const arr of this.cells()) {
        for (const cell of arr) {
          if (cell.id === id) {
            return cell;
          }
        }
      }
      return null;
    }

    updateCellById(id: number, cell: BoardCell) {
      const cells = this.cells();
      const updatedCells = cells.map(row => {
        return row.map(c => {
          if (c.id === id) {
            return { ...c, ...cell };
          }
          return c;
        });
      });
      this.cells.set(updatedCells);
    }

    setClickedId(id: number) {
      this.clickedId.set(id);
    }


}
