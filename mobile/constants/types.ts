export interface Cat {
  id: number;
  name: string;
  breed: string; // Pastikan backend kirim ini
  age: number;
  gender: string;
  status: string;
  image: string; // Nama file gambar
  description?: string;
}
