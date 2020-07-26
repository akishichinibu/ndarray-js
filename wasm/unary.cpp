#include <cmath>

extern "C" {
    void batch_sin(unsigned int n, double* a, double* b) {
        for (auto i = 0; i < n; i++) b[i] = std::sin(a[i]);
    }

    double simple_sin(double a) {
        return std::sin(a);
    }

    EM_PORT_API(void) random_fill(unsigned int length) {
        for (unsigned int i = 0; i < length; i++) 
    }
}
