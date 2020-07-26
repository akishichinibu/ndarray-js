
void batch_add(unsigned int n, double* a, double b, double* c) {
    for (auto i = 0; i < n; i++) c[i] = a[i] + b;
}
