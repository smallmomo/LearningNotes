

public class MergeSort {

    public static void mergeSort(int[] arr, int left, int right) {

        // 递归结束
        if (left >= right) {
            return;
        }

        // 中间位置
        int mid = left + (right - left) / 2;

        // 排序左边
        mergeSort(arr, left, mid);

        // 排序右边
        mergeSort(arr, mid + 1, right);

        // 合并
        merge(arr, left, mid, right);
    }

    public static void merge(int[] arr,
                             int left,
                             int mid,
                             int right) {

        // 临时数组
        int[] temp = new int[right - left + 1];

        int i = left;
        int j = mid + 1;
        int k = 0;

        // 两边同时比较
        while (i <= mid && j <= right) {

            if (arr[i] <= arr[j]) {
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
            }
        }

        // 左边剩余
        while (i <= mid) {
            temp[k++] = arr[i++];
        }

        // 右边剩余
        while (j <= right) {
            temp[k++] = arr[j++];
        }

        // 拷贝回原数组
        for (int p = 0; p < temp.length; p++) {
            arr[left + p] = temp[p];
        }
    }

    public static void main(String[] args) {

        int[] arr = {8,4,5,7,1,3,6,2};

        mergeSort(arr, 0, arr.length - 1);

        for (int num : arr) {
            System.out.print(num + " ");
        }
    }
}