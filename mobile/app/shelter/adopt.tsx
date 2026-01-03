import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import apiClient, { API_BASE_URL } from '../../api/apiClient';

const { width } = Dimensions.get('window');
const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://192.168.1.5:3000';

const resolveBackendUrl = (path: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

const resolveImageUrl = (path: string) => {
  if (!path || path === 'null') return 'https://via.placeholder.com/150'; // Placeholder
  if (path.startsWith('http')) return path;
  if (path.startsWith('/public/')) return `${serverUrl}${path}`;
  if (path.startsWith('profile-')) return `${serverUrl}/public/img/profile/${path}`;
  return `${serverUrl}/public/img/cats/${path}`;
};

export default function ShelterAdoptionDashboard() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/adopt/my-reports');
      setReports(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal mengambil data laporan adopsi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (id: number, status: 'approved' | 'rejected') => {
    const actionText = status === 'approved' ? 'menyetujui' : 'menolak';
    
    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin ingin ${actionText} adopsi ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Ya, Proses', 
          onPress: async () => {
            try {
              await apiClient.patch(`/adopt/verify/${id}`, { status });
              Alert.alert('Berhasil', `Status adopsi berhasil diperbarui.`);
              fetchReports();
            } catch (error) {
              Alert.alert('Error', 'Gagal memproses verifikasi.');
            }
          }
        }
      ]
    );
  };

  const openDocument = async (url: string) => {
    const fullUrl = resolveBackendUrl(url);
    if (fullUrl) {
      await WebBrowser.openBrowserAsync(fullUrl);
    }
  };

  const filteredReports = useMemo(() => {
    if (activeTab === 'pending') {
      return reports.filter(r => r.status === 'pending');
    }
    return reports.filter(r => r.status !== 'pending');
  }, [reports, activeTab]);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#cfe3d4', '#3A5F50']}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          {/* HEADER */}
          <View className="items-center py-6">
            <Text className="text-2xl font-extrabold text-white">Dashboard Adopsi</Text>
            
            {/* TABS */}
            <View className="flex-row bg-white/90 p-1 rounded-full mt-6 shadow-lg">
              <TouchableOpacity 
                onPress={() => setActiveTab('pending')}
                className={`px-8 py-2 rounded-full flex-row items-center ${activeTab === 'pending' ? 'bg-[#EBCD5E]' : ''}`}
              >
                <Text className={`font-bold text-sm ${activeTab === 'pending' ? 'text-white' : 'text-gray-500'}`}>Menunggu</Text>
                {reports.filter(r => r.status === 'pending').length > 0 && (
                  <View className="bg-red-500 rounded-full px-1.5 ml-2">
                    <Text className="text-white text-[10px] font-bold">
                      {reports.filter(r => r.status === 'pending').length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActiveTab('history')}
                className={`px-8 py-2 rounded-full ${activeTab === 'history' ? 'bg-[#3A5F50]' : ''}`}
              >
                <Text className={`font-bold text-sm ${activeTab === 'history' ? 'text-white' : 'text-gray-500'}`}>Riwayat</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* LIST CONTENT */}
          {loading ? (
            <ActivityIndicator color="white" size="large" className="mt-20" />
          ) : (
            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
              {filteredReports.length === 0 ? (
                <View className="bg-white/80 rounded-3xl p-10 items-center mt-10 shadow-lg">
                  <FontAwesome name={activeTab === 'pending' ? 'clipboard' : 'history'} size={40} color="#9ca3af" />
                  <Text className="text-gray-500 mt-3 text-center">
                    {activeTab === 'pending' ? 'Tidak ada permintaan baru.' : 'Belum ada riwayat.'}
                  </Text>
                </View>
              ) : (
                filteredReports.map((report) => (
                  <View 
                    key={report.id} 
                    className={`bg-white rounded-2xl p-4 mb-4 shadow-sm border-l-4 ${
                      report.status === 'pending' ? 'border-l-[#EBCD5E]' : 
                      report.status === 'approved' ? 'border-l-green-500' : 'border-l-red-500'
                    }`}
                  >
                    {/* Compact Header Clickable */}
                    <TouchableOpacity 
                      onPress={() => setExpandedId(expandedId === report.id ? null : report.id)}
                      className="flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1">
                        <Image 
                          source={{ uri: resolveImageUrl(report.adopter.profilePic) }} 
                          className="w-12 h-12 rounded-full bg-gray-200"
                        />
                        <View className="ml-3 flex-1">
                          <View className="flex-row items-center">
                            <Text className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mr-2 ${
                              report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                              report.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {report.status}
                            </Text>
                            <Text className="text-xs text-gray-400">{report.date}</Text>
                          </View>
                          <Text className="font-bold text-gray-800 text-base" numberOfLines={1}>
                            {report.adopter.name} <Text className="font-normal text-gray-500 text-xs">ingin adopsi</Text> {report.catName}
                          </Text>
                        </View>
                      </View>
                      <FontAwesome name={expandedId === report.id ? 'chevron-up' : 'chevron-down'} size={14} color="#9ca3af" />
                    </TouchableOpacity>

                    {/* Expandable Details */}
                    {expandedId === report.id && (
                      <View className="mt-4 pt-4 border-t border-gray-100">
                        <Text className="font-bold text-gray-900 mb-2">Data Pelamar</Text>
                        <View className="space-y-1">
                          <Text className="text-sm text-gray-600"><Text className="font-medium">NIK:</Text> {report.adopter.nik}</Text>
                          <Text className="text-sm text-gray-600"><Text className="font-medium">HP:</Text> {report.adopter.phone}</Text>
                          <Text className="text-sm text-gray-600"><Text className="font-medium">Pekerjaan:</Text> {report.adopter.job}</Text>
                          <Text className="text-sm text-gray-600 mb-3"><Text className="font-medium">Alamat:</Text> {report.adopter.address}</Text>
                        </View>

                        <Text className="font-bold text-gray-900 mb-2 mt-4">Dokumen</Text>
                        <View className="flex-row gap-2">
                          {report.adopter.documentUrl && (
                            <TouchableOpacity 
                              onPress={() => openDocument(report.adopter.documentUrl)}
                              className="bg-green-50 border border-green-100 p-2 rounded-lg flex-row items-center"
                            >
                              <FontAwesome name="file-pdf-o" size={16} color="#ef4444" />
                              <Text className="text-[#3A5F50] text-xs font-bold ml-2">Surat Pernyataan</Text>
                            </TouchableOpacity>
                          )}
                          {report.adopter.identityUrl && (
                            <TouchableOpacity 
                              onPress={() => openDocument(report.adopter.identityUrl)}
                              className="bg-gray-50 border border-gray-200 p-2 rounded-lg flex-row items-center"
                            >
                              <FontAwesome name="id-card" size={16} color="#3b82f6" />
                              <Text className="text-gray-600 text-xs font-bold ml-2">Foto KTP</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Action Buttons */}
                        {report.status === 'pending' && (
                          <View className="flex-row justify-end mt-6 gap-3">
                            <TouchableOpacity 
                              onPress={() => handleVerification(report.id, 'rejected')}
                              className="px-6 py-2 rounded-xl border border-red-200"
                            >
                              <Text className="text-red-600 font-bold">Tolak</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              onPress={() => handleVerification(report.id, 'approved')}
                              className="px-6 py-2 rounded-xl bg-[#3A5F50] shadow-md"
                            >
                              <Text className="text-white font-bold">Setujui</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))
              )}
              {/* Spacer Bottom */}
              <View className="h-20" />
            </ScrollView>
          )}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
